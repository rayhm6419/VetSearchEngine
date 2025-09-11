import { prisma } from '@/server/db';
import { Place, Review as UIReview } from '@/lib/types';
import { Prisma } from '@/generated/prisma';
import { boundingBox } from '@/server/geo/distance';

function mapPlace(db: any): Place {
  return {
    id: db.id,
    name: db.name,
    type: db.type,
    phone: db.phone ?? undefined,
    website: db.website ?? undefined,
    address: db.address,
    zipcode: db.zipcode,
    lat: db.lat ?? undefined,
    lng: db.lng ?? undefined,
    priceLevel: (db.priceLevel ?? undefined) as any,
    services: (db.services || []).map((s: any) => s.name) as string[],
    rating: typeof db.rating === 'number' ? db.rating : undefined,
    reviewCount: typeof db.reviewCount === 'number' ? db.reviewCount : undefined,
    photos: undefined,
    distanceKm: typeof db.distance_km === 'number' ? db.distance_km :
      typeof db.distanceKm === 'number' ? db.distanceKm : undefined,
    hours: undefined,
    source: 'db',
  };
}

function mapReview(db: any): UIReview {
  const authorName = db.user?.username || db.user?.email || 'Anonymous';
  return {
    id: db.id,
    author: { name: authorName },
    rating: db.rating,
    date: db.createdAt.toISOString(),
    text: db.text,
  };
}

export const placeService = {
  async getById(id: string): Promise<Place | null> {
    const db = await prisma.place.findUnique({
      where: { id },
      include: { services: true },
    });
    return db ? mapPlace(db) : null;
  },

  async searchByZip({ zip, type, take = 50, skip = 0 }: { zip?: string; type?: 'vet' | 'shelter'; take?: number; skip?: number; }): Promise<Place[]> {
    const where = {
      ...(zip ? { zipcode: zip } : {}),
      ...(type ? { type } : {}),
    } as const;

    try {
      const db = await prisma.place.findMany({
        where,
        include: { services: true },
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { name: 'asc' },
        ],
        take,
        skip,
      });
      return db.map(mapPlace);
    } catch (err: any) {
      // Fallback for stale client/runtime where rating/reviewCount are not yet available
      if (err?.name === 'PrismaClientValidationError') {
        const db = await prisma.place.findMany({
          where,
          include: { services: true },
          orderBy: { name: 'asc' },
          take,
          skip,
        });
        return db.map(mapPlace);
      }
      throw err;
    }
  },

  async searchByRadius({
    centerLat,
    centerLng,
    radiusKm,
    type,
    take = 20,
    skip = 0,
  }: {
    centerLat: number;
    centerLng: number;
    radiusKm: number;
    type?: 'vet' | 'shelter';
    take?: number;
    skip?: number;
  }): Promise<Place[]> {
    const engine = (process.env.GEO_ENGINE || 'haversine').toLowerCase();
    const bbox = boundingBox({ lat: centerLat, lng: centerLng, radiusKm });

    if (engine === 'postgis') {
      // Requires a PostGIS geometry/geography column named geom; fall back if not available
      try {
        const whereType = type ? Prisma.sql`AND p."type" = ${type}` : Prisma.sql``;
        const rows: any[] = await prisma.$queryRaw(Prisma.sql`
          SELECT p.*, 
                 ST_DistanceSphere(ST_SetSRID(ST_MakePoint(${centerLng}, ${centerLat}), 4326), ST_SetSRID(ST_MakePoint(p."lng", p."lat"), 4326)) / 1000.0 AS distance_km
          FROM "Place" p
          WHERE p."lat" IS NOT NULL AND p."lng" IS NOT NULL
            AND p."lat" BETWEEN ${bbox.minLat} AND ${bbox.maxLat}
            AND p."lng" BETWEEN ${bbox.minLng} AND ${bbox.maxLng}
            ${whereType}
          ORDER BY distance_km ASC, p."rating" DESC, p."reviewCount" DESC
          LIMIT ${take} OFFSET ${skip}
        `);
        // Filter to radiusKm in JS as safety
        return rows
          .filter(r => typeof r.distance_km === 'number' && r.distance_km <= radiusKm)
          .map(mapPlace);
      } catch (e) {
        // Fall through to haversine if PostGIS functions not present
        if (process.env.NODE_ENV !== 'production') console.warn('postgis_path_failed_falling_back', e);
      }
    }

    // Plain Postgres using Haversine formula; prefilter with bounding box
    const whereType = type ? Prisma.sql`AND p."type" = ${type}` : Prisma.sql``;
    try {
      const rows: any[] = await prisma.$queryRaw(Prisma.sql`
        SELECT * FROM (
          SELECT 
            p.*, 
            (6371 * acos(
              cos(radians(${centerLat})) * cos(radians(p."lat")) * cos(radians(p."lng") - radians(${centerLng})) +
              sin(radians(${centerLat})) * sin(radians(p."lat"))
            )) AS distance_km
          FROM "Place" p
          WHERE p."lat" IS NOT NULL AND p."lng" IS NOT NULL
            AND p."lat" BETWEEN ${bbox.minLat} AND ${bbox.maxLat}
            AND p."lng" BETWEEN ${bbox.minLng} AND ${bbox.maxLng}
            ${whereType}
        ) AS sub
        WHERE distance_km <= ${radiusKm}
        ORDER BY distance_km ASC, sub."rating" DESC, sub."reviewCount" DESC
        LIMIT ${take} OFFSET ${skip}
      `);
      return rows.map(mapPlace);
    } catch (e) {
      // Fallback for older DBs without rating/reviewCount columns
      if (process.env.NODE_ENV !== 'production') console.warn('haversine_fallback_simple_order', e);
      const rows: any[] = await prisma.$queryRaw(Prisma.sql`
        SELECT * FROM (
          SELECT 
            p.*, 
            (6371 * acos(
              cos(radians(${centerLat})) * cos(radians(p."lat")) * cos(radians(p."lng") - radians(${centerLng})) +
              sin(radians(${centerLat})) * sin(radians(p."lat"))
            )) AS distance_km
          FROM "Place" p
          WHERE p."lat" IS NOT NULL AND p."lng" IS NOT NULL
            AND p."lat" BETWEEN ${bbox.minLat} AND ${bbox.maxLat}
            AND p."lng" BETWEEN ${bbox.minLng} AND ${bbox.maxLng}
            ${whereType}
        ) AS sub
        WHERE distance_km <= ${radiusKm}
        ORDER BY distance_km ASC
        LIMIT ${take} OFFSET ${skip}
      `);
      return rows.map(mapPlace);
    }
  },

  async getReviews(placeId: string, take = 20, skip = 0): Promise<UIReview[]> {
    const db = await prisma.review.findMany({
      where: { placeId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
    return db.map(mapReview);
  },

  async recomputeRating(placeId: string): Promise<{ rating: number; reviewCount: number; }> {
    const agg = await prisma.review.aggregate({
      where: { placeId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    const rating = Number(agg._avg.rating || 0);
    const reviewCount = agg._count._all;
    try {
      await prisma.place.update({ where: { id: placeId }, data: { rating, reviewCount } });
    } catch (err: any) {
      // Handle stale Prisma Client that doesn't yet know about rating/reviewCount
      if (err?.name !== 'PrismaClientValidationError') throw err;
      // Swallow and return computed values so the UI updates immediately.
    }
    return { rating, reviewCount };
  },
};
