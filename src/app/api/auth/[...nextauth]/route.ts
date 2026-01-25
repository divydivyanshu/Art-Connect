import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                loginType: { label: "Login Type", type: "text" }, // 'user' | 'artist' | 'admin'
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { artistProfile: true },
                });

                if (!user || !user.passwordHash) {
                    throw new Error("Invalid email or password");
                }

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!isValid) {
                    throw new Error("Invalid email or password");
                }

                // Role-based login validation
                const loginType = credentials.loginType || 'user';

                if (loginType === 'artist' && user.role !== 'artist') {
                    throw new Error("This account is not registered as an artist");
                }

                if (loginType === 'user' && user.role === 'artist') {
                    throw new Error("Please use the artist login page");
                }

                if (loginType === 'admin' && user.role !== 'admin') {
                    throw new Error("You do not have admin privileges");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    artistProfileId: user.artistProfile?.id || null,
                };
            },
        }),
        CredentialsProvider({
            id: "phone-otp",
            name: "Phone OTP",
            credentials: {
                phone: { label: "Phone", type: "text" },
                otp: { label: "OTP", type: "text" },
                loginType: { label: "Login Type", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.otp) {
                    throw new Error("Phone number and OTP are required");
                }

                // MVP: Accept any 6-digit OTP for demo purposes
                if (credentials.otp.length !== 6 || !/^\d+$/.test(credentials.otp)) {
                    throw new Error("Invalid OTP. Please enter a 6-digit code.");
                }

                const user = await prisma.user.findFirst({
                    where: { phone: credentials.phone },
                    include: { artistProfile: true },
                });

                if (!user) {
                    throw new Error("No account found with this phone number");
                }

                // Role-based login validation
                const loginType = credentials.loginType || 'user';

                if (loginType === 'artist' && user.role !== 'artist') {
                    throw new Error("This account is not registered as an artist");
                }

                if (loginType === 'user' && user.role === 'artist') {
                    throw new Error("Please use the artist login page");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    artistProfileId: user.artistProfile?.id || null,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.artistProfileId = user.artistProfileId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.artistProfileId = token.artistProfileId as string | null;
            }
            return session;
        },
    },
    pages: {
        signIn: "/user/login",
        error: "/user/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || "artconnect-super-secret-key-change-in-production",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
