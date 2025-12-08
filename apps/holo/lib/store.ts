import { generateId, UIMessage } from 'ai';

// In-memory storage - resets on server restart
const chatStore = new Map<string, UIMessage[]>();

export async function createChat(): Promise<string> {
  const id = generateId(); // generate a unique chat ID
  chatStore.set(id, []); // create an empty chat in memory
  return id;
}

export async function loadChat(id: string): Promise<UIMessage[]> {
  const messages = chatStore.get(id);
  if (!messages) {
    return [];
  }
  return messages;
}

export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  chatStore.set(chatId, messages);
}
