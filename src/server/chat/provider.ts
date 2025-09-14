export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export interface ChatProvider {
  stream(messages: ChatMessage[]): AsyncGenerator<string>;
  model?: string;
  name?: string;
}

// Factory for swapping LLM backends later (lazy dynamic import)
export async function chooseProvider(): Promise<ChatProvider> {
  const provider = (process.env.CHAT_PROVIDER || 'mock').toLowerCase();
  switch (provider) {
    case 'openai': {
      const mod = await import('./providers/openai');
      return new mod.OpenAIProvider(process.env.OPENAI_API_KEY || '', process.env.CHAT_OPENAI_MODEL || 'gpt-4o-mini');
    }
    case 'mock':
    default: {
      const mod = await import('./providers/mock');
      return new mod.MockProvider();
    }
  }
}
