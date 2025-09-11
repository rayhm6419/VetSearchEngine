import type { Message } from '@/lib/chat/types';

export type StreamHandle = {
  onToken: (cb: (token: string) => void) => void;
  onDone: (cb: () => void) => void;
  onError: (cb: (err: string) => void) => void;
  cancel: () => void;
};

export function streamChat({ messages }: { messages: Message[] }): StreamHandle {
  let tokenCb: (t: string) => void = () => {};
  let doneCb: () => void = () => {};
  let errorCb: (e: string) => void = () => {};
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.map(m => ({ role: m.role, content: m.content })) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => 'Chat failed');
        throw new Error(err || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let isFirst = true;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        if (isFirst) {
          // Drop the first JSON meta line
          const nl = text.indexOf('\n');
          if (nl >= 0) {
            const rest = text.slice(nl + 1);
            if (rest) tokenCb(rest);
            isFirst = false;
          } else {
            // Wait next chunk to complete the first line
            continue;
          }
        } else {
          if (text) tokenCb(text);
        }
      }
      doneCb();
    } catch (e: any) {
      errorCb(e?.message || 'chat_failed');
    }
  })();

  return {
    onToken(cb) { tokenCb = cb; },
    onDone(cb) { doneCb = cb; },
    onError(cb) { errorCb = cb; },
    cancel() { controller.abort(); },
  };
}

