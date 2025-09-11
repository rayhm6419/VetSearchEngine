import { ChatMessage, ChatProvider } from '../provider';
import { pickResponse } from '../utils/pickResponse';
import { chunkText } from '../utils/reply';

export class MockProvider implements ChatProvider {
  stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const reply = pickResponse(messages);
    return chunkText(reply, 25, 25); // ~25 chars per chunk, 25ms delay
  }
}

