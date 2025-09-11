/*
  Prisma seed script
  - Imports mock PLACES and REVIEWS
  - Seeds users, places (with services), and reviews
  - Recomputes rating and reviewCount per place
*/

import { prisma } from '@/server/db';
import { PLACES, REVIEWS } from '@/lib/mock-data';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Seeding database...');

  // Seed ZIP code centers
  const dataDir = path.join(process.cwd(), 'prisma', 'data');
  const primaryCsv = path.join(dataDir, 'zipcodes.csv');
  const sampleCsv = path.join(dataDir, 'zipcodes.sample.csv');
  const csvPath = fs.existsSync(primaryCsv) ? primaryCsv : (fs.existsSync(sampleCsv) ? sampleCsv : null);
  if (csvPath) {
    console.log(`Seeding ZIP codes from ${path.basename(csvPath)}...`);
    const csv = fs.readFileSync(csvPath, 'utf8');
    const rows = csv.split(/\r?\n/).filter(Boolean);
    let count = 0;
    for (const line of rows.slice(1)) { // skip header
      const [zip, city, state, latStr, lngStr] = line.split(',');
      if (!zip) continue;
      const lat = Number(latStr);
      const lng = Number(lngStr);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      await prisma.zipCode.upsert({
        where: { zip },
        update: { city, state, lat, lng },
        create: { zip, city, state, lat, lng },
      });
      count++;
    }
    console.log(`Seeded ${count} ZIP rows.`);
  } else {
    console.warn('No ZIP dataset found (prisma/data/zipcodes.csv). Skipping ZipCode seeding.');
  }

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

  // Ensure each place has coordinates; if missing, try ZipCode fallback
  const placesMissing = await prisma.place.findMany({ where: { OR: [{ lat: null }, { lng: null }] } });
  for (const p of placesMissing) {
    const z = await prisma.zipCode.findUnique({ where: { zip: p.zipcode } });
    if (z) {
      await prisma.place.update({ where: { id: p.id }, data: { lat: z.lat, lng: z.lng } });
    }
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
