import { readFileSync } from 'fs';
import { join } from 'path';
import { createAISDKClient, getSystemPrompt } from 'ai-client';
import type { AIProviderConfig, AISDKCoreTool } from 'ai-client';
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  StreamTextResult,
  tool,
  validateUIMessages,
} from 'ai';
import { loadChat, saveChat } from '@/lib/store';
import z from 'zod';
import { fetchPersona } from '@/lib/persona';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

// Read provider configuration from holo.json
function getProviderConfig(): AIProviderConfig {
  const holoConfigPath = join(process.cwd(), 'holo.json');
  const holoConfig = JSON.parse(readFileSync(holoConfigPath, 'utf-8'));

  const { providers } = holoConfig;

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
function getCoreConfig() {
  const holoConfigPath = join(process.cwd(), 'holo.json');
  const holoConfig = JSON.parse(readFileSync(holoConfigPath, 'utf-8'));

  const { core } = holoConfig;

  return {
    coreUrl: core.url,
    apiKey: process.env.CORE_API_KEY,
    labels: core.labels,
  };
}

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
  const coreConfig = getCoreConfig();
  const previousMessages = await loadChat(id);
  // Append new message to previousMessages messages
  const finalMessages = [...previousMessages, ...messages];

  // Fetch persona from Core API
  const persona = await fetchPersona();

  // Get provider configuration
  const providerConfig = getProviderConfig();

  // Create AI client
  const { client } = await createAISDKClient(providerConfig);
  const tools = {
    search: tool({
      description:
        "Search stored memories for past conversations, user preferences, project context, and decisions. USE THIS TOOL: 1) At start of every conversation to find related context, 2) When user mentions past work or projects, 3) Before answering questions that might have previous context. HOW TO USE: Write a simple query describing what to find (e.g., 'user code preferences', 'authentication bugs', 'API setup steps'). Returns: Markdown-formatted context optimized for LLM consumption, including session compacts, episodes, and key facts with temporal metadata.",
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

        return await response.json();
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
