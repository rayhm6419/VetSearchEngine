import { NextRequest } from 'next/server';
import { apiError, apiResponse } from '@/server/http/apiResponse';
import { formatZodError } from '@/server/http/zodFormat';
import { PlaceIdParamSchema } from '@/server/validation/place.schema';
import { placeService } from '@/server/services/placeService';
import { withRequestLog } from '@/server/http/log';
import { AppError } from '@/server/http/errors';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> | { id: string } } | any) {
  return withRequestLog('GET /api/places/[id]', async () => {
    try {
      const raw = ctx?.params;
      const params = typeof raw?.then === 'function' ? await raw : raw;
      const parsed = PlaceIdParamSchema.safeParse(params);
      if (!parsed.success) return apiError('BAD_REQUEST', formatZodError(parsed.error), 400);
      const place = await placeService.getById(parsed.data.id);
      if (!place) return apiError('NOT_FOUND', 'Place not found', 404);
      const res = apiResponse(place);
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res;
    } catch (e: any) {
      if (e instanceof AppError) return apiError(e.code, e.message, e.status);
      if (process.env.NODE_ENV !== 'production') console.error('place_get_error', e);
      return apiError('INTERNAL', 'Something went wrong', 500);
    }
  });
}
