import { ChatContext, Message, StreamHandle } from './types';

const EMERGENCY = `If this is an emergency, call your nearest 24/7 veterinary hospital.
For Seattle (98101), consider:
- Downtown Animal Hospital (206) 555-0123
- Emergency Vet Seattle (206) 555-9000

Keep your pet warm, limit movement, and bring medical records if available.`;

const EXOTICS = `For exotic pets, look for clinics that explicitly list 'Exotics' or 'Avian/Reptile'.
In Bellevue (98004), Bellevue Veterinary Clinic is known for exotics care.
Call ahead to confirm species.`;

const GENERIC = `I can help you refine your search.
Try adding a ZIP (e.g., 98101) or type 'vet'/'shelter'.
You can also filter by services like 'Emergency' or 'Dental'.`;

function pickResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('emergency')) return EMERGENCY;
  if (p.includes('exotics')) return EXOTICS;
  return GENERIC;
}

export function startStream({ messages, context }: { messages: Message[]; context?: ChatContext }): StreamHandle {
  const last = messages[messages.length - 1];
  const text = pickResponse(last?.content || '');
  const tokens = text.split(/(\s+)/); // include spaces for smoother stream

  let tokenCb: ((t: string) => void) | null = null;
  let doneCb: (() => void) | null = null;
  let errorCb: ((e: string) => void) | null = null;

  let i = 0;
  const interval = setInterval(() => {
    if (i >= tokens.length) {
      clearInterval(interval);
      doneCb && doneCb();
      console.log('chat_stream_done');
      return;
    }
    tokenCb && tokenCb(tokens[i++]);
  }, 35);

  return {
    onToken(cb) { tokenCb = cb; },
    onDone(cb) { doneCb = cb; },
    onError(cb) { errorCb = cb; },
    cancel() {
      clearInterval(interval);
      errorCb && errorCb('cancelled');
    },
  };
}

// Future adapter stub
export async function requestChat({ messages, context }: { messages: Array<{ role: string; content: string }>; context?: ChatContext }) {
  console.log('requestChat (stub)', { messages, context });
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const handle = startStream({ messages: messages as any, context });
      let output = '';
      handle.onToken((t) => {
        output += t;
        controller.enqueue(encoder.encode(t));
      });
      handle.onDone(() => controller.close());
      handle.onError(() => controller.close());
    },
  });
  return stream;
}


