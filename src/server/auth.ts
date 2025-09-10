import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { AppError } from '@/server/http/errors';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/server/db';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getSession();
  const user = (session as any)?.user as { id?: string; email?: string; username?: string } | undefined;
  if (!user?.id) {
    throw new AppError('UNAUTHORIZED', 'Sign in required', 401);
  }
  return { id: user.id!, email: user.email, username: user.username };
}

// For Route Handlers: derive from JWT to be robust in edge/runtime contexts
export async function requireUserFromRequest(req: NextRequest) {
  // First, try reading the JWT directly (works best in route handlers)
  const secret = (authOptions as any)?.secret || process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret }).catch(() => null);
  const id = (token as any)?.id || (token as any)?.sub;
  if (id) {
    // Ensure user exists in DB (guards against stale tokens from old in-memory users)
    const found = await prisma.user.findUnique({ where: { id: String(id) }, select: { id: true, email: true, username: true } });
    if (found) return { id: found.id, email: found.email, username: found.username };
  }

  // Fallback to getServerSession if JWT couldn't be read
  const session = await getServerSession(authOptions).catch(() => null) as any;
  const user = session?.user as { id?: string; email?: string; username?: string } | undefined;
  if (user?.id) {
    const found = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, email: true, username: true } });
    if (found) return { id: found.id, email: found.email, username: found.username };
  }

  throw new AppError('UNAUTHORIZED', 'Sign in required', 401);
}
