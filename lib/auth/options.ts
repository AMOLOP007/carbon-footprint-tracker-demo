import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                await connectToDB();
                const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+password +failedLoginAttempts +lockoutUntil");

                if (!user) {
                    throw new Error("Invalid credentials");
                }

                if (user.lockoutUntil && user.lockoutUntil > new Date()) {
                    throw new Error("Account temporarily locked. Try again later.");
                }

                if (!user.password) {
                    throw new Error("Please log in with Google");
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);

                if (!isMatch) {
                    const attempts = (user.failedLoginAttempts || 0) + 1;
                    let updates: any = { failedLoginAttempts: attempts };
                    if (attempts >= 5) {
                        updates.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
                    }
                    await User.findByIdAndUpdate(user._id, updates);
                    throw new Error("Invalid credentials");
                }

                // Update last login and reset lockout
                await User.findByIdAndUpdate(user._id, {
                    lastLogin: new Date(),
                    failedLoginAttempts: 0,
                    lockoutUntil: null
                });

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role
                };
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }: any) {
            if (account?.provider === 'google') {
                try {
                    await connectToDB();
                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        await User.create({
                            name: user.name,
                            email: user.email,
                            provider: "google",
                            providerId: account.providerAccountId,
                            role: "user",
                            lastLogin: new Date()
                        });
                    } else {
                        // Link account if not already linked or update last login
                        if (existingUser.provider !== "google") {
                            // Optional: deciding how to handle account merging. 
                            // For now, we'll allow it but update provider? 
                            // Or just unblock them.
                            // SAFE OPTION: Just update lastLogin
                        }
                        await User.findByIdAndUpdate(existingUser._id, {
                            lastLogin: new Date(),
                            // Ensure providerId is set if missing
                            providerId: existingUser.providerId || account.providerAccountId
                        });
                    }
                    return true;
                } catch (error) {
                    console.error("Error saving Google user", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account, profile }: any) {
            if (user) {
                if (account?.provider === 'google') {
                    // For Google login, fetch the user from DB to get the MongoDB _id
                    try {
                        await connectToDB();
                        const dbUser = await User.findOne({ email: user.email });
                        if (dbUser) {
                            token.id = dbUser._id.toString();
                            token.role = dbUser.role;
                        }
                    } catch (error) {
                        console.error("Error fetching user in JWT callback", error);
                    }
                } else {
                    // For credentials login, user.id is already the MongoDB _id
                    token.id = user.id;
                    token.role = user.role;
                }
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login', // Redirect error back to login
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("Please define the NEXTAUTH_SECRET environment variable inside .env.local");
}
