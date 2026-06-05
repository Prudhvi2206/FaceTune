import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password");
        }

        await connectDB();

        const user = await User.findOne({
          $or: [
            { email: credentials.email },
            { username: credentials.email },
          ],
        }).select("+password");

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isMatch) {
          throw new Error("Invalid credentials");
        }

        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        return {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        if (!user.email) {
          console.error("OAuth sign-in failed: No email provided by provider");
          return false;
        }
        try {
          await connectDB();

          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            const username =
              user.email.split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "") ||
              `user${Date.now()}`;

            // Ensure username is unique
            let finalUsername = username;
            let counter = 1;
            while (await User.findOne({ username: finalUsername })) {
              finalUsername = `${username}${counter}`;
              counter++;
            }

            await User.create({
              fullName: user.name || "User",
              username: finalUsername,
              email: user.email,
              image: user.image || "",
              provider: account.provider as "google" | "github",
            });
          } else {
            await User.findByIdAndUpdate(existingUser._id, {
              lastLogin: new Date(),
              image: user.image || existingUser.image,
            });
          }
        } catch (error) {
          console.error("Error during OAuth sign-in:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email ?? undefined });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.username = dbUser.username;
          token.fullName = dbUser.fullName;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as Record<string, unknown>).id = token.id as string;
        (session.user as unknown as Record<string, unknown>).username = token.username as string;
        (session.user as unknown as Record<string, unknown>).fullName = token.fullName as string;
      }
      return session;
    },
  },
});

