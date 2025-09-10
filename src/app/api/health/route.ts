import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET() {
  try {
    // Simple connectivity check
    await prisma.$queryRaw`SELECT 1`;

    // Optional: verify one of our models is reachable
    let placeCount: number | null = null;
    try {
      placeCount = await prisma.place.count();
    } catch {
      // table may not exist yet if migrations haven't run
      placeCount = null;
    }

    return NextResponse.json({ ok: true, db: true, placeCount });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, db: false, error: e?.message || 'DB error' },
      { status: 500 }
    );
  }
}

