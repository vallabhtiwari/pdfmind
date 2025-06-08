import prisma from "@/lib/db";
import NextAuth, { AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signIn({ user }) {
      if (!user.email) return;
      const existing = await prisma.userLimits.findUnique({
        where: {
          userEmail: user.email,
        },
      });
      if (!existing) {
        await prisma.userLimits.create({
          data: {
            userEmail: user.email,
          },
        });
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
