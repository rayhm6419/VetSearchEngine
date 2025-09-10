/*
  Prisma seed script
  - Imports mock PLACES and REVIEWS
  - Seeds users, places (with services), and reviews
  - Recomputes rating and reviewCount per place
*/

import { prisma } from '@/server/db';
import { PLACES, REVIEWS } from '@/lib/mock-data';

async function main() {
  console.log('Seeding database...');

  // Create or reuse a demo user for reviews
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      username: 'demo_user',
      name: 'Demo User',
    },
  });

  // Seed places and services
  for (const p of PLACES) {
    const place = await prisma.place.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        type: p.type as any,
        phone: p.phone,
        website: p.website,
        address: p.address,
        zipcode: p.zipcode,
        lat: p.lat ?? null,
        lng: p.lng ?? null,
        priceLevel: (p.priceLevel as any) ?? null,
      },
      create: {
        id: p.id, // keep mock IDs for easier cross-reference
        name: p.name,
        type: p.type as any,
        phone: p.phone,
        website: p.website,
        address: p.address,
        zipcode: p.zipcode,
        lat: p.lat ?? null,
        lng: p.lng ?? null,
        priceLevel: (p.priceLevel as any) ?? null,
      },
    });

    // Upsert services for this place
    const services = p.services || [];
    for (const s of services) {
      await prisma.placeService.upsert({
        where: { placeId_name: { placeId: place.id, name: s } },
        update: {},
        create: { placeId: place.id, name: s },
      });
    }
  }

  // Seed reviews for each place (reuse mock reviews)
  for (const p of PLACES) {
    for (const r of REVIEWS) {
      await prisma.review.create({
        data: {
          placeId: p.id,
          userId: demoUser.id,
          rating: Math.max(1, Math.min(5, r.rating)),
          text: r.text,
          createdAt: new Date(r.date),
        },
      });
    }

    // Recompute rating & reviewCount
    const agg = await prisma.review.aggregate({
      where: { placeId: p.id },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await prisma.place.update({
      where: { id: p.id },
      data: {
        rating: Number(agg._avg.rating || 0),
        reviewCount: agg._count._all,
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

