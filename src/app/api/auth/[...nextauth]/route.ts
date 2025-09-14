import NextAuth, { NextAuthOptions, NextAuthConfig } from "next-auth";

export const runtime = 'nodejs';

async function getAuthConfig(): Promise<NextAuthOptions> {
  const AUTH_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const AUTH_URL = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  const HAS_DB = Boolean(process.env.DATABASE_URL);

  const cfg: NextAuthOptions = {
    secret: AUTH_SECRET,
    session: { strategy: 'jwt' },
    pages: { signIn: '/login' },
    providers: [],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          // attach a few fields when user just signed in
          (token as any).id = (user as any).id;
          (token as any).email = (user as any).email;
          (token as any).username = (user as any).username;
        }
        return token as any;
      },
      async session({ session, token }) {
        if (!session.user) (session as any).user = {} as any;
        (session as any).user.id = (token as any).id;
        (session as any).user.email = (token as any).email;
        (session as any).user.username = (token as any).username;
        return session as any;
      },
    },
  };

  // Always include a Credentials provider so NextAuth initializes, but
  // only hit Prisma when a DB connection is configured.
  const { default: Credentials } = await import('next-auth/providers/credentials');

  if (HAS_DB) {
    // Lazy-load Prisma adapter and client
    try {
      const { PrismaAdapter } = await import('@next-auth/prisma-adapter');
      const { prisma } = await import('@/server/db');
      (cfg as any).adapter = PrismaAdapter(prisma);
    } catch (e) {
      // If adapter load fails, continue without adapter to avoid import-time crashes on Vercel
      if (process.env.NODE_ENV !== 'production') console.warn('auth_adapter_load_failed', e);
    }
  }

  (cfg as any).providers = [
    Credentials({
      name: 'Email',
      credentials: { email: { label: 'Email', type: 'text' } },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        if (!email) return null;
        if (!HAS_DB) return null; // no-db mode: disallow sign-in but keep route healthy
        try {
          const { prisma } = await import('@/server/db');
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;
          return { id: user.id, email: user.email!, username: user.username } as any;
        } catch {
          return null;
        }
      },
    }),
  ];

  // Avoid top-level throws. If secrets are missing, we return config without them
  // and let the request handler surface a friendly JSON.
  return cfg;
}

export async function GET(req: Request, ctx: any) {
  const config = await getAuthConfig();
  if (!config.secret) {
    const body = JSON.stringify({ ok: false, error: { code: 'AUTH_MISCONFIG', message: 'Missing AUTH_SECRET/NEXTAUTH_SECRET' } });
    return new Response(body, { status: 500, headers: { 'content-type': 'application/json' } });
  }
  const handler = NextAuth(config as NextAuthConfig);
  return handler(req, ctx);
}

export const POST = GET;
