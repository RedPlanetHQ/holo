import { readFileSync } from 'fs';
import path, { join } from 'path';
import { createAISDKClient, getSystemPrompt } from 'ai-client';
import type { AIProviderConfig } from 'ai-client';
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  validateUIMessages,
} from 'ai';
import { loadChat, saveChat } from '@/lib/store';
import z from 'zod';
import { fetchPersona } from '@/lib/persona';
import { promises as fs } from 'fs';
import { HoloConfig } from '@/types/schema';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;
const holoConfigPath = process.env.HOLO_CONFIG_PATH ?? process.cwd();

// Read provider configuration from holo.json
async function getProviderConfig(
  config: HoloConfig,
): Promise<AIProviderConfig> {
  const { providers } = config;

  return {
    name: providers.name,
    type: providers.name, // Using name as type for compatibility
    model: providers.model,
    config: {
      baseURL: providers.baseUrl,
      apiKey: process.env[`${providers.name.toUpperCase()}_API_KEY`] || '',
    },
  };
}

// Read provider configuration from holo.json
function getCoreConfig(config: HoloConfig) {
  const { core } = config;

  return {
    coreUrl: core.url,
    apiKey: process.env.CORE_API_KEY,
    labels: core.labels,
  };
}

const getConfig = async () => {
  const holoJsonPath = path.join(holoConfigPath, 'holo.json');
  const holoConfig = JSON.parse(await fs.readFile(holoJsonPath, 'utf8'));

  return holoConfig;
};

// Memory tool schemas (Zod-based)
const SearchParamsSchema = z.object({
  query: z
    .string()
    .describe(
      'Search query optimized for knowledge graph retrieval. Choose the right query structure based on your search intent:\n\n' +
      '1. **Entity-Centric Queries** (Best for graph search):\n' +
      '   - ✅ GOOD: "User\'s preferences for code style and formatting"\n' +
      '   - ✅ GOOD: "Project authentication implementation decisions"\n' +
      '   - ❌ BAD: "user code style"\n' +
      '   - Format: [Person/Project] + [relationship/attribute] + [context]\n\n' +
      '2. **Multi-Entity Relationship Queries** (Excellent for episode graph):\n' +
      '   - ✅ GOOD: "User and team discussions about API design patterns"\n' +
      '   - ✅ GOOD: "relationship between database schema and performance optimization"\n' +
      '   - ❌ BAD: "user team api design"\n' +
      '   - Format: [Entity1] + [relationship type] + [Entity2] + [context]\n\n' +
      '3. **Semantic Question Queries** (Good for vector search):\n' +
      '   - ✅ GOOD: "What causes authentication errors in production? What are the security requirements?"\n' +
      '   - ✅ GOOD: "How does caching improve API response times compared to direct database queries?"\n' +
      '   - ❌ BAD: "auth errors production"\n' +
      '   - Format: Complete natural questions with full context\n\n' +
      '4. **Concept Exploration Queries** (Good for BFS traversal):\n' +
      '   - ✅ GOOD: "concepts and ideas related to database indexing and query optimization"\n' +
      '   - ✅ GOOD: "topics connected to user authentication and session management"\n' +
      '   - ❌ BAD: "database indexing concepts"\n' +
      '   - Format: [concept] + related/connected + [domain/context]\n\n' +
      'Avoid keyword soup queries - use complete phrases with proper context for best results.',
    ),
  validAt: z
    .string()
    .optional()
    .describe(
      "Optional: ISO timestamp (like '2024-01-15T10:30:00Z'). Get facts that were true at this specific time. Leave empty for current facts.",
    ),
  startTime: z
    .string()
    .optional()
    .describe(
      "Optional: ISO timestamp (like '2024-01-01T00:00:00Z'). Only find memories created AFTER this time. " +
      "USE WHEN: User asks for 'recent', 'this week', 'last month', 'since X date' queries. " +
      'EXAMPLES: ' +
      "- 'recent work' → set startTime to 7 days ago; " +
      "- 'this week' → set startTime to start of current week; " +
      "- 'since January' → set startTime to '2025-01-01T00:00:00Z'. " +
      "IMPORTANT: Calculate relative dates from today's date (see system context). Combine with sortBy='recency' for chronological timeline.",
    ),
  endTime: z
    .string()
    .optional()
    .describe(
      "Optional: ISO timestamp (like '2024-12-31T23:59:59Z'). Only find memories created BEFORE this time. " +
      "USE WHEN: User asks for historical queries like 'before X date', 'until last month', or specific time ranges. " +
      'EXAMPLES: ' +
      "- 'work from last month' → set startTime to first day of last month, endTime to last day of last month; " +
      "- 'before March' → set endTime to '2025-03-01T00:00:00Z'; " +
      "- 'between Jan and Mar' → set startTime='2025-01-01T00:00:00Z', endTime='2025-03-31T23:59:59Z'. " +
      'IMPORTANT: Use with startTime to define time windows. Always use ISO format with timezone (Z for UTC).',
    ),
  labelIds: z
    .array(z.string())
    .optional()
    .describe(
      'Optional: Array of label UUIDs to filter search results. Leave empty to search all labels.',
    ),
  sortBy: z
    .enum(['relevance', 'recency'])
    .optional()
    .describe(
      "Optional: Sort results by 'relevance' (default, best semantic matches ranked by rerank score) or 'recency' (chronological order, newest first). Use 'relevance' for conceptual questions and 'recency' for timeline/recent activity queries.",
    ),
});

export async function POST(req: Request) {
  const requestBody = await req.json();

  const { messages, id } = requestBody;
  const config = await getConfig();
  const coreConfig = getCoreConfig(config);
  const previousMessages = await loadChat(id);
  // Append new message to previousMessages messages
  const finalMessages = [...previousMessages, ...messages];

  // Fetch persona from Core API
  const persona = await fetchPersona(coreConfig);

  // Get provider configuration
  const providerConfig = await getProviderConfig(config);

  // Create AI client
  const { client } = await createAISDKClient(providerConfig);
  const tools = {
    search: tool({
      description:
        "CRITICAL: You MUST use this tool before responding to ANY question about yourself, your experiences, work, opinions, or past. This searches YOUR knowledge graph - your actual memories, blog posts, projects, and conversations. ALWAYS search first with a relevant query before answering questions. Example queries: 'my experience with React', 'projects I built in 2024', 'my thoughts on AI', 'what I wrote about databases'. Returns your authentic memories and writings in markdown format.",
      inputSchema: SearchParamsSchema,
      execute: async (
        params: z.infer<typeof SearchParamsSchema>,
      ): Promise<string> => {
        const response = await fetch(`${coreConfig.coreUrl}/api/v1/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${coreConfig.apiKey}`,
          },
          body: JSON.stringify({
            ...params,
            labelIds: coreConfig.labels,
          }),
        });

        if (!response.ok) {
          return 'No memory found';
        }

        const result = await response.json();

        return result;
      },
    }),
  };

  const validatedMessages = await validateUIMessages({
    messages: finalMessages,
  });

  const model = await client.getModel();

  const result = streamText({
    model,
    messages: [
      {
        role: 'system',
        content: getSystemPrompt(persona),
      },
      ...convertToModelMessages(validatedMessages, {
        tools,
      }),
    ],
    tools,

    stopWhen: [stepCountIs(10)],
  });

  result.consumeStream(); // no await

  return result.toUIMessageStreamResponse({
    originalMessages: validatedMessages,
    onFinish: ({ messages }: any) => {
      saveChat({ chatId: id, messages });
    },
  });
}
