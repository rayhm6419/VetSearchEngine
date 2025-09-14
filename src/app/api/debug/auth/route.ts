import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Not available' } }, { status: 404 });
  }
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret: secret as any }).catch(() => null);
  return NextResponse.json({ ok: true, data: {
    hasToken: Boolean(token),
    token: token ? { id: (token as any).id || (token as any).sub, email: (token as any).email, username: (token as any).username } : null,
    cookieNames: req.cookies.getAll().map(c => c.name),
  }});
}
