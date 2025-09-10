import { NextRequest } from 'next/server';
import { apiError, apiResponse, buildPagination } from '@/server/http/apiResponse';
import { formatZodError } from '@/server/http/zodFormat';
import { placeService } from '@/server/services/placeService';
import { SearchQuerySchema } from '@/server/validation/search.schema';
import { withRequestLog } from '@/server/http/log';
import { AppError } from '@/server/http/errors';

export async function GET(req: NextRequest) {
  return withRequestLog('GET /api/search', async () => {
    try {
      const url = new URL(req.url);
      const parsed = SearchQuerySchema.safeParse(Object.fromEntries(url.searchParams));
      if (!parsed.success) {
        return apiError('BAD_REQUEST', formatZodError(parsed.error), 400);
      }
      const { zip, type, take, skip } = parsed.data;
      const items = await placeService.searchByZip({ zip, type, take, skip });
      const res = apiResponse({ items, pagination: buildPagination({ take, skip, total: items.length }) });
      res.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
      return res;
    } catch (e: any) {
      if (e instanceof AppError) return apiError(e.code, e.message, e.status);
      if (process.env.NODE_ENV !== 'production') console.error('search_error', e);
      return apiError('INTERNAL', 'Something went wrong', 500);
    }
  });
}
