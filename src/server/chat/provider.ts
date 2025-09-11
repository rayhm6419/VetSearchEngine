export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export interface ChatProvider {
  stream(messages: ChatMessage[]): AsyncGenerator<string>;
  model?: string;
  name?: string;
}

// Factory for swapping LLM backends later
export function chooseProvider(): ChatProvider {
  const provider = (process.env.CHAT_PROVIDER || 'mock').toLowerCase();
  switch (provider) {
    case 'openai': {
      const { OpenAIProvider } = require('./providers/openai') as typeof import('./providers/openai');
      return new OpenAIProvider(process.env.OPENAI_API_KEY || '', process.env.CHAT_OPENAI_MODEL || 'gpt-4o-mini');
    }
    case 'mock':
    default: {
      // Lazy import to keep serverless bundle small
      const { MockProvider } = require('./providers/mock') as typeof import('./providers/mock');
      return new MockProvider();
    }
  }
}
