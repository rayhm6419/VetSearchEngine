import { NextRequest } from 'next/server';
import { apiError, apiResponse, buildPagination } from '@/server/http/apiResponse';
import { formatZodError } from '@/server/http/zodFormat';
import { ListReviewsQuerySchema, PlaceIdParamSchema } from '@/server/validation/place.schema';
import { CreateReviewBodySchema } from '@/server/validation/review.schema';
import { placeService } from '@/server/services/placeService';
import { reviewService } from '@/server/services/reviewService';
import { withRequestLog } from '@/server/http/log';
import { requireUserFromRequest } from '@/server/auth';
import { AppError } from '@/server/http/errors';

// Very simple in-memory rate limit: 5 reviews/min per user
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rlMap = new Map<string, number[]>();

function checkRateLimit(userId: string) {
  const now = Date.now();
  const arr = rlMap.get(userId) || [];
  const recent = arr.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  rlMap.set(userId, recent);
  return true;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> | { id: string } } | any) {
  return withRequestLog('GET /api/places/[id]/reviews', async () => {
    try {
      const raw = ctx?.params;
      const params = typeof raw?.then === 'function' ? await raw : raw;
      const idParsed = PlaceIdParamSchema.safeParse(params);
      if (!idParsed.success) return apiError('BAD_REQUEST', formatZodError(idParsed.error), 400);
      const url = new URL(req.url);
      const qParsed = ListReviewsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
      if (!qParsed.success) return apiError('BAD_REQUEST', formatZodError(qParsed.error), 400);
      const { take, skip } = qParsed.data;
      const items = await placeService.getReviews(idParsed.data.id, take, skip);
      const res = apiResponse({ items, pagination: buildPagination({ take, skip, total: items.length }) });
      res.headers.set('Cache-Control', 'private, no-store');
      return res;
    } catch (e: any) {
      if (e instanceof AppError) return apiError(e.code, e.message, e.status);
      if (process.env.NODE_ENV !== 'production') console.error('reviews_get_error', e);
      return apiError('INTERNAL', 'Something went wrong', 500);
    }
  });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> | { id: string } } | any) {
  return withRequestLog('POST /api/places/[id]/reviews', async () => {
    try {
      const raw = ctx?.params;
      const params = typeof raw?.then === 'function' ? await raw : raw;
      const idParsed = PlaceIdParamSchema.safeParse(params);
      if (!idParsed.success) return apiError('BAD_REQUEST', formatZodError(idParsed.error), 400);

      const ctype = req.headers.get('content-type') || '';
      if (!ctype.includes('application/json')) return apiError('BAD_REQUEST', 'Content-Type must be application/json', 415);

      const body = await req.json().catch(() => null);
      const bodyParsed = CreateReviewBodySchema.safeParse({
        rating: body?.rating,
        text: String(body?.text || '').trim(),
      });
      if (!bodyParsed.success) return apiError('BAD_REQUEST', formatZodError(bodyParsed.error), 400);

      const { id: userId } = await requireUserFromRequest(req);
      if (!checkRateLimit(userId)) return apiError('RATE_LIMITED', 'Too many reviews, slow down', 429);

      // naive HTML tag strip and enforce max length
      const cleanText = bodyParsed.data.text.replace(/<[^>]*>/g, '').slice(0, 1000);
      const review = await reviewService.createReview({
        placeId: idParsed.data.id,
        userId,
        rating: bodyParsed.data.rating,
        text: cleanText,
      });
      const { rating, reviewCount } = await placeService.recomputeRating(idParsed.data.id);

      const res = apiResponse({ review, place: { id: idParsed.data.id, rating, reviewCount } });
      res.headers.set('Cache-Control', 'no-store');
      return res;
    } catch (e: any) {
      if (e instanceof AppError) return apiError(e.code, e.message, e.status);
      if (process.env.NODE_ENV !== 'production') {
        console.error('reviews_post_error', e);
        return apiError('INTERNAL', e?.message || 'Something went wrong', 500);
      }
      return apiError('INTERNAL', 'Something went wrong', 500);
    }
  });
}
