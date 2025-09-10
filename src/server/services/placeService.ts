import { prisma } from '@/server/db';
import { Place, Review as UIReview } from '@/lib/types';

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
    hours: undefined,
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
    await prisma.place.update({ where: { id: placeId }, data: { rating, reviewCount } });
    return { rating, reviewCount };
  },
};
