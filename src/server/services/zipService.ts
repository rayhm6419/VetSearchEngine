import { prisma } from '@/server/db';

export const zipService = {
  async getCenter(zip: string): Promise<{ lat: number; lng: number } | null> {
    const row = await prisma.zipCode.findUnique({ where: { zip } });
    if (!row) return null;
    return { lat: row.lat, lng: row.lng };
  },
};

