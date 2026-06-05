import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Providers are populated in auth.ts for Node.js runtime
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth;
    },
  },
} satisfies NextAuthConfig;
