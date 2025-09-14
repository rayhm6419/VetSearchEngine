import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError } from '@/server/http/apiResponse';
import { chooseProvider } from '@/server/chat/provider';
import { requireUserFromRequest } from '@/server/auth';

const ChatMsgSchema = z.object({ role: z.enum(['system', 'user', 'assistant']), content: z.string() });
const ChatBodySchema = z.object({
  messages: z.array(ChatMsgSchema).max(Number(process.env.CHAT_MAX_MESSAGES || 20)),
  model: z.string().optional(),
});

// In-memory rate limiter (per user or IP)
const rl = new Map<string, number[]>();
const RL_MAX = Number(process.env.CHAT_RATE_LIMIT || 30);
const RL_WINDOW = Number(process.env.CHAT_RATE_WINDOW_SEC || 300) * 1000;

function keyFor(req: NextRequest, userId?: string) {
  if (userId) return `u:${userId}`;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '0.0.0.0';
  return `ip:${ip}`;
}

function checkRate(req: NextRequest, userId?: string) {
  const k = keyFor(req, userId);
  const now = Date.now();
  const arr = rl.get(k) || [];
  const recent = arr.filter((t) => now - t < RL_WINDOW);
  if (recent.length >= RL_MAX) return false;
  recent.push(now);
  rl.set(k, recent);
  return true;
}

export async function POST(req: NextRequest) {
  const requireAuth = (process.env.CHAT_REQUIRE_AUTH || 'false').toLowerCase() === 'true';

  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return apiError('BAD_REQUEST', 'Content-Type must be application/json', 415);
    }

    const bodyRaw = await req.json().catch(() => null);
    const messages = Array.isArray(bodyRaw?.messages) ? bodyRaw.messages : [];

    // Trim + validate messages
    const trimmed = messages.map((m: any) => ({ role: m?.role, content: String(m?.content || '').trim() }))
      .filter((m: any) => m.content.length > 0 && m.content.length <= Number(process.env.CHAT_MAX_CHARS_PER_MSG || 2000));

    const parsed = ChatBodySchema.safeParse({ messages: trimmed, model: bodyRaw?.model });
    if (!parsed.success) {
      const issue = parsed.error.issues?.[0];
      return apiError('BAD_REQUEST', issue ? issue.message : 'Invalid body', 400);
    }

    let userId: string | undefined;
    if (requireAuth) {
      const u = await requireUserFromRequest(req);
      userId = u.id;
    }

    if (!checkRate(req, userId)) return apiError('RATE_LIMITED', 'Slow down', 429);

    const start = Date.now();
    const provider = await chooseProvider();

    // Create streaming response
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const enc = new TextEncoder();
        try {
          // Meta first line
          controller.enqueue(
            enc.encode(
              JSON.stringify({ ok: true, meta: { model: provider.model || 'mock-stream', provider: provider.name || (process.env.CHAT_PROVIDER || 'mock') } }) + '\n'
            )
          );
          let charsOut = 0;
          try {
            for await (const chunk of provider.stream(parsed.data.messages)) {
              charsOut += chunk.length;
              controller.enqueue(enc.encode(chunk));
            }
          } catch (provErr: any) {
            // Provider failed (e.g., OpenAI 401/403/429). Fallback to mock streaming so UX still works.
            if (process.env.NODE_ENV !== 'production') {
              console.warn('chat_provider_error', provErr?.message || provErr);
            }
            const mod = await import('@/server/chat/providers/mock');
            const mock = new mod.MockProvider();
            const preface = `\n[Provider unavailable: ${provErr?.message || 'error'}]\nUsing demo response:\n\n`;
            charsOut += preface.length;
            controller.enqueue(enc.encode(preface));
            for await (const chunk of mock.stream(parsed.data.messages)) {
              charsOut += chunk.length;
              controller.enqueue(enc.encode(chunk));
            }
          }
          controller.close();
          const ms = Date.now() - start;
          if (process.env.NODE_ENV !== 'production') {
            const charsIn = parsed.data.messages.reduce((n, m) => n + (m.content?.length || 0), 0);
            console.log(JSON.stringify({ evt: 'chat_done', userId, msgs: parsed.data.messages.length, charsIn, charsOut, ms }));
          }
        } catch (e: any) {
          controller.error(e);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    const dev = process.env.NODE_ENV !== 'production';
    if (dev) {
      console.error('chat_route_error', e);
      return apiError('INTERNAL', e?.message || 'Something went wrong', 500);
    }
    return apiError('INTERNAL', 'Something went wrong', 500);
  }
}

export const dynamic = 'force-dynamic';
