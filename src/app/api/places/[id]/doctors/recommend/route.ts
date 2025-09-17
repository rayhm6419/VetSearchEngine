import { NextRequest } from 'next/server';
import { apiError, apiResponse } from '@/server/http/apiResponse';
import { withRequestLog } from '@/server/http/log';
import { AppError } from '@/server/http/errors';
import { PlaceIdParamSchema } from '@/server/validation/place.schema';
import { requireUserFromRequest } from '@/server/auth';
import { placeService } from '@/server/services/placeService';
import { z } from 'zod';

const Body = z.object({ name: z.string().min(1).max(120), reason: z.string().max(500).optional().nullable() });

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> | { id: string } } | any) {
  return withRequestLog('POST /api/places/[id]/doctors/recommend', async () => {
    try {
      const raw = ctx?.params;
      const params = typeof raw?.then === 'function' ? await raw : raw;
      const parsed = PlaceIdParamSchema.safeParse(params);
      if (!parsed.success) return apiError('BAD_REQUEST', 'Invalid place id', 400);
      const user = await requireUserFromRequest(req);
      const body = await req.json().catch(() => null);
      const pb = Body.safeParse(body);
      if (!pb.success) return apiError('BAD_REQUEST', 'Invalid payload', 400);
      const topDoctors = await placeService.recommendDoctor(parsed.data.id, user.id, pb.data.name.trim(), (pb.data.reason || undefined));
      return apiResponse({ topDoctors });
    } catch (e: any) {
      if (e instanceof AppError) return apiError(e.code, e.message, e.status);
      if (process.env.NODE_ENV !== 'production') console.error('doctor_recommend_error', e);
      return apiError('INTERNAL', 'Something went wrong', 500);
    }
  });
}
