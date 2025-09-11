import { prisma } from '@/server/db';
import { ExternalSource } from '@/generated/prisma';

export const reviewService = {
  async listForExternal(source: 'petfinder', externalId: string, take = 20, skip = 0) {
    const items = await prisma.review.findMany({
      where: { externalSource: ExternalSource.petfinder, externalId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
    const reviews = items.map((db) => ({
      id: db.id,
      author: { name: db.user?.username || db.user?.email || 'Anonymous' },
      rating: db.rating,
      date: db.createdAt.toISOString(),
      text: db.text,
    }));
    const agg = await prisma.review.aggregate({
      where: { externalSource: ExternalSource.petfinder, externalId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    const rating = Number(agg._avg.rating || 0);
    const reviewCount = agg._count._all;
    return { reviews, rating, reviewCount };
  },

  async createForExternal({ userId, externalId, rating, text }: { userId: string; externalId: string; rating: number; text: string; }) {
    const row = await prisma.review.create({
      data: { userId, externalSource: ExternalSource.petfinder, externalId, rating, text },
    });
    return row;
  },
};
