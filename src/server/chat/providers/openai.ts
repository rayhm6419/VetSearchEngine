import { ChatMessage, ChatProvider } from '../provider';

export class OpenAIProvider implements ChatProvider {
  name = 'openai';
  model: string;
  private apiKey: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Map messages to OpenAI format
    const payload = {
      model: this.model,
      stream: true,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.7,
    } as const;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => 'OpenAI request failed');
      throw new Error(`OpenAI ${res.status}: ${errText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE format: lines beginning with "data: {json}\n"
      const lines = buffer.split('\n');
      // keep the last partial line in buffer
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') {
          return;
        }
        try {
          const json = JSON.parse(data);
          const delta: string | undefined = json?.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {
          // ignore malformed chunks
        }
      }
    }
  }
}

