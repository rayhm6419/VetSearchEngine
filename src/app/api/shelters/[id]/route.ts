import { NextRequest } from 'next/server';
import { apiError, apiResponse } from '@/server/http/apiResponse';
import { withRequestLog } from '@/server/http/log';
import { AppError } from '@/server/http/errors';
import { ShelterIdParamSchema } from '@/server/validation/shelter.schema';
import { getOrganization } from '@/server/petfinder/client';
import { toPlaceDTO } from '@/server/petfinder/mappers';

export async function GET(_req: NextRequest, ctx: any) {
  return withRequestLog('GET /api/shelters/[id]', async () => {
    try {
      const pRaw: any = (ctx as any).params;
      const params = typeof pRaw?.then === 'function' ? await pRaw : pRaw;
      const parsed = ShelterIdParamSchema.safeParse(params);
      if (!parsed.success) return apiError('BAD_REQUEST', 'Invalid shelter id', 400);
      const org = await getOrganization(parsed.data.id);
      if (!org) return apiError('NOT_FOUND', 'Shelter not found', 404);
      const dto = toPlaceDTO(org);
      const res = apiResponse(dto);
      res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=300');
      return res;
    } catch (e: any) {
      if (e instanceof AppError) return apiError(e.code, e.message, e.status);
      if (process.env.NODE_ENV !== 'production') console.error('shelter_get_error', e);
      return apiError('INTERNAL', 'Something went wrong', 500);
    }
  });
}
