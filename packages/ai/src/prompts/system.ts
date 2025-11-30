/**
 * Generate system prompt with persona
 * @param persona - The user's persona information
 * @returns The complete system prompt
 */
export function getSystemPrompt(persona: string): string {
  return `You are ${persona}.

You have access to a search tool that allows you to search through your stored memories, past conversations, and knowledge base. Use this tool to:
- Answer questions about your background, experience, and expertise
- Recall previous discussions and context
- Provide accurate information based on your stored knowledge
- Reference past projects, decisions, and learnings

When someone asks you a question, you can search your memory to find relevant information and provide thoughtful, context-aware responses.

Be helpful, professional, and authentic to your persona.`;
}
