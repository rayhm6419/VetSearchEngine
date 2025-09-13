import { NextRequest } from 'next/server';
import { apiError, apiResponse } from '@/server/http/apiResponse';
import { withRequestLog } from '@/server/http/log';
import { prisma } from '@/server/db';
import { placeService } from '@/server/services/placeService';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> | { id: string } } | any) {
  return withRequestLog('GET /api/places/[id]/nearby', async () => {
    const raw = ctx?.params;
    const params = typeof raw?.then === 'function' ? await raw : raw;
    const id = params?.id as string;
    const radiusKm = 5;
    const take = 10;
    const place = await prisma.place.findUnique({ where: { id } });
    if (!place || place.lat == null || place.lng == null) {
      return apiError('NOT_FOUND', 'Place not found or missing coordinates', 404);
    }
    const items = await placeService.searchByRadius({ centerLat: place.lat, centerLng: place.lng, radiusKm, take, skip: 0 });
    const res = apiResponse({ items, center: { lat: place.lat, lng: place.lng }, radiusKm });
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res;
  });
}
