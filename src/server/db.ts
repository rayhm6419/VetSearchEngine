import { PrismaClient } from '@/generated/prisma';

// Ensure a single PrismaClient instance in dev (Next.js hot reload)
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
