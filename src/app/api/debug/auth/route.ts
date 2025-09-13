import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/server/authOptions';

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Not available' } }, { status: 404 });
  }
  const secret = (authOptions as any)?.secret || process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret }).catch(() => null);
  const session = await getServerSession(authOptions).catch(() => null) as any;
  return NextResponse.json({ ok: true, data: {
    hasToken: Boolean(token),
    token: token ? { id: (token as any).id || (token as any).sub, email: (token as any).email, username: (token as any).username } : null,
    session: session?.user ? { id: session.user.id, email: session.user.email, username: (session.user as any).username } : null,
    cookieNames: req.cookies.getAll().map(c => c.name),
  }});
}
