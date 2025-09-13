import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/server/db";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Credentials({
      name: "Email",
      credentials: { email: { label: "Email", type: "text" } },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        if (!email) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        return { id: user.id, email: user.email, username: user.username } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
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

