import { prisma } from '@/server/db';
import { Review as UIReview } from '@/lib/types';
import { placeService } from './placeService';

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

export const reviewService = {
  async createReview({ placeId, userId, rating, text }: { placeId: string; userId?: string | null; rating: number; text: string; }): Promise<UIReview> {
    const r = Math.max(1, Math.min(5, Math.round(rating)));
    const db = await prisma.review.create({
      data: {
        placeId,
        userId: userId || null,
        rating: r,
        text,
      },
      include: { user: true },
    });
    await placeService.recomputeRating(placeId);
    return mapReview(db);
  },

  async listByPlace(placeId: string, take = 20, skip = 0): Promise<UIReview[]> {
    const db = await prisma.review.findMany({
      where: { placeId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
    return db.map(mapReview);
  },
};

