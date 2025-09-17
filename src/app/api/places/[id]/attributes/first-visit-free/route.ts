import { NextRequest } from 'next/server';
import { apiError, apiResponse } from '@/server/http/apiResponse';
import { withRequestLog } from '@/server/http/log';
import { AppError } from '@/server/http/errors';
import { PlaceIdParamSchema } from '@/server/validation/place.schema';
import { requireUserFromRequest } from '@/server/auth';
import { placeService } from '@/server/services/placeService';
import { z } from 'zod';

const Body = z.object({ value: z.coerce.boolean() });

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> | { id: string } } | any) {
  return withRequestLog('POST /api/places/[id]/attributes/first-visit-free', async () => {
    try {
      const raw = ctx?.params;
      const params = typeof raw?.then === 'function' ? await raw : raw;
      const parsed = PlaceIdParamSchema.safeParse(params);
      if (!parsed.success) return apiError('BAD_REQUEST', 'Invalid place id', 400);
      const user = await requireUserFromRequest(req);
      const body = await req.json().catch(() => null);
      const pb = Body.safeParse(body);
      if (!pb.success) return apiError('BAD_REQUEST', 'Invalid payload', 400);
      const counts = await placeService.voteFirstVisitFree(parsed.data.id, user.id, pb.data.value);
      return apiResponse(counts);
    } catch (e: any) {
      if (e instanceof AppError) return apiError(e.code, e.message, e.status);
      if (process.env.NODE_ENV !== 'production') console.error('first_visit_free_error', e);
      return apiError('INTERNAL', 'Something went wrong', 500);
    }
  });
}
