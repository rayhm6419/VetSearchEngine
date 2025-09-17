import { NextRequest } from 'next/server';
import { apiError, apiResponse } from '@/server/http/apiResponse';
import { withRequestLog } from '@/server/http/log';
import { AppError } from '@/server/http/errors';
import { PlaceIdParamSchema } from '@/server/validation/place.schema';
import { requireUserFromRequest } from '@/server/auth';
import { z } from 'zod';
import { placeService } from '@/server/services/placeService';

const VoteBody = z.object({
  attribute: z.literal('FIRST_VISIT_FREE'),
  value: z.coerce.boolean(),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> | { id: string } } | any) {
  return withRequestLog('POST /api/places/[id]/attributes', async () => {
    try {
      const raw = ctx?.params;
      const params = typeof raw?.then === 'function' ? await raw : raw;
      const parsed = PlaceIdParamSchema.safeParse(params);
      if (!parsed.success) return apiError('BAD_REQUEST', 'Invalid place id', 400);
      const body = await req.json().catch(() => null);
      const pb = VoteBody.safeParse(body);
      if (!pb.success) return apiError('BAD_REQUEST', 'Invalid attribute payload', 400);
      const user = await requireUserFromRequest(req);
      const counts = await placeService.voteFirstVisitFree(parsed.data.id, user.id, pb.data.value);
      return apiResponse({ attribute: pb.data.attribute, counts });
    } catch (e: any) {
      if (e instanceof AppError) return apiError(e.code, e.message, e.status);
      if (process.env.NODE_ENV !== 'production') console.error('attributes_post_error', e);
      return apiError('INTERNAL', 'Something went wrong', 500);
    }
  });
}

