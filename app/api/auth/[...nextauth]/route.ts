import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Admin from "@/lib/models/admin";
import bcrypt from "bcryptjs";
import {connectdb} from "@/lib/connectdb";
import User from "@/lib/models/User";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Sign In",
      credentials: {
        matricNumber: { label: "Matric Number", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectdb();
        console.log("Database connected.");

        if (
          !credentials?.matricNumber ||
          !credentials?.email ||
          !credentials?.password
        ) {
          throw new Error("Matric Number, Email, and Password are required.");
        }

        const sanitizedMatricNumber = credentials.matricNumber.trim();
        const sanitizedEmail = credentials.email.trim().toLowerCase();

        console.log("Sanitized inputs:", {
          matricNumber: sanitizedMatricNumber,
          email: sanitizedEmail,
        });

        let user;
        let userType: "super-admin" | "Admin" | "Sub-Admin" | "user" | null = null;

        const foundUser = await User.findOne({
          matricNumber: sanitizedMatricNumber,
          email: sanitizedEmail,
        });

        if (foundUser) {
          user = foundUser;
          userType = foundUser.role === "super-admin" ? "super-admin" : "user"; // ✅ this line is fine now
        } else {
          const foundAdmin = await Admin.findOne({
            matricNumber: sanitizedMatricNumber,
            email: sanitizedEmail,
          });

          if (foundAdmin) {
            user = foundAdmin;
            userType = foundAdmin.role === "Admin" ? "Admin" : "Sub-Admin";
          }
        }

        if (!user || !userType) {
          throw new Error("User not found or not authorized.");
        }

        console.log("User found:", user);

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValidPassword) {
          throw new Error("Invalid password.");
        }

        return {
          id: user._id.toString(),
          matricNumber: user.matricNumber,
          email: user.email,
          role: userType,
          name: user.matricNumber,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    signOut: "/auth/signout",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.matricNumber = user.matricNumber;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        email: token.email as string,
        matricNumber: token.matricNumber as string,
        role: token.role as string,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };
