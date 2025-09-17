import { NextRequest } from 'next/server';
import { apiError, apiResponse } from '@/server/http/apiResponse';
import { withRequestLog } from '@/server/http/log';
import { AppError } from '@/server/http/errors';
import { ShelterIdParamSchema } from '@/server/validation/shelter.schema';
import { requireUserFromRequest } from '@/server/auth';
import { z } from 'zod';
import { shelterService } from '@/server/services/shelterService';
import { checkRateLimit } from '@/server/middleware/rateLimit';

export const runtime = 'nodejs';

const Body = z.object({ key: z.literal('first_visit_free'), value: z.enum(['yes', 'no']) });

export async function POST(req: NextRequest, ctx: any) {
  return withRequestLog('POST /api/shelters/[id]/attributes', async () => {
    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local';
      const rl = checkRateLimit(`${ip}:shelter_attr`);
      if (!rl.allowed) return apiError('RATE_LIMITED', 'Too many requests, try later.', 429);
      const paramsRaw: any = ctx?.params;
      const params = typeof paramsRaw?.then === 'function' ? await paramsRaw : paramsRaw;
      const p = ShelterIdParamSchema.safeParse(params);
      if (!p.success) return apiError('BAD_REQUEST', 'Invalid shelter id', 400);
      const body = await req.json().catch(() => null);
      const b = Body.safeParse(body);
      if (!b.success) return apiError('BAD_REQUEST', 'Invalid payload', 400);
      const user = await requireUserFromRequest(req);
      const agg = await shelterService.voteFirstVisitFree(p.data.id, user.id, b.data.value);
      return apiResponse({ infoCard: { firstVisitFree: { yes: agg.yes, no: agg.no, score: agg.score, confidence: agg.confidence } } });
    } catch (e: any) {
      if (e instanceof AppError) return apiError(e.code, e.message, e.status);
      if (process.env.NODE_ENV !== 'production') console.error('shelter_attr_error', e);
      return apiError('INTERNAL', 'Something went wrong', 500);
    }
  });
}

