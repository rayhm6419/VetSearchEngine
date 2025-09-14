import { NextRequest } from 'next/server';
import { apiError, apiResponse } from '@/server/http/apiResponse';
import { withRequestLog } from '@/server/http/log';
import { AppError } from '@/server/http/errors';
import { ShelterIdParamSchema, ListShelterReviewsQuerySchema, CreateShelterReviewBodySchema } from '@/server/validation/shelter.schema';
import { reviewService } from '@/server/services/reviewService';
import { requireUserFromRequest } from '@/server/auth';

export async function GET(req: NextRequest, ctx: any) {
  return withRequestLog('GET /api/shelters/[id]/reviews', async () => {
    try {
      const paramsRaw: any = (ctx as any).params;
      const params = typeof paramsRaw?.then === 'function' ? await paramsRaw : paramsRaw;
      const p = ShelterIdParamSchema.safeParse(params);
      if (!p.success) return apiError('BAD_REQUEST', 'Invalid shelter id', 400);
      const url = new URL(req.url);
      const q = ListShelterReviewsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
      if (!q.success) return apiError('BAD_REQUEST', 'Invalid query', 400);
      const { reviews, rating, reviewCount } = await reviewService.listForExternal('petfinder', p.data.id, q.data.take, q.data.skip);
      const res = apiResponse({ items: reviews, summary: { rating, reviewCount } });
      res.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
      return res;
    } catch (e: any) {
      if (e instanceof AppError) return apiError(e.code, e.message, e.status);
      if (process.env.NODE_ENV !== 'production') console.error('shelter_reviews_get_error', e);
      return apiError('INTERNAL', 'Something went wrong', 500);
    }
  });
}

export async function POST(req: NextRequest, ctx: any) {
  return withRequestLog('POST /api/shelters/[id]/reviews', async () => {
    try {
      const user = await requireUserFromRequest(req);

      const paramsRaw: any = (ctx as any).params;
      const params = typeof paramsRaw?.then === 'function' ? await paramsRaw : paramsRaw;
      const p = ShelterIdParamSchema.safeParse(params);
      if (!p.success) return apiError('BAD_REQUEST', 'Invalid shelter id', 400);
      const body = await req.json().catch(() => ({}));
      const b = CreateShelterReviewBodySchema.safeParse(body);
      if (!b.success) return apiError('BAD_REQUEST', 'Invalid body', 400);

      await reviewService.createForExternal({ userId: user.id, externalId: p.data.id, rating: b.data.rating, text: b.data.text });
      const { reviews, rating, reviewCount } = await reviewService.listForExternal('petfinder', p.data.id, 20, 0);
      return apiResponse({ items: reviews, summary: { rating, reviewCount } });
    } catch (e: any) {
      if (e instanceof AppError) return apiError(e.code, e.message, e.status);
      if (process.env.NODE_ENV !== 'production') console.error('shelter_reviews_post_error', e);
      return apiError('INTERNAL', 'Something went wrong', 500);
    }
  });
}
