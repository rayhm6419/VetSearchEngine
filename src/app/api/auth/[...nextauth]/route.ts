import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findUserByEmail } from "@/lib/users";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        if (!email) return null;
        const user = findUserByEmail(email);
        if (!user) return null;
        return { id: user.id, email: user.email, username: user.username } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = (user as any).email;
        token.username = (user as any).username;
      }
      return token as any;
    },
    async session({ session, token }) {
      if (token?.email) {
        (session as any).user = { ...(session.user || {}), email: token.email, username: (token as any).username };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };


