
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
// Microsoft requires Azure AD provider
import AzureADProvider from "next-auth/providers/azure-ad"
import { connectToDB } from "@/lib/db"
import User from "@/models/User"

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        AppleProvider({
            clientId: process.env.APPLE_ID || "",
            clientSecret: process.env.APPLE_SECRET || "",
        }),
        AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID || "",
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
            tenantId: process.env.AZURE_AD_TENANT_ID,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }: any) {
            if (account.provider === 'google' || account.provider === 'apple' || account.provider === 'azure-ad') {
                try {
                    await connectToDB();
                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            provider: account.provider,
                            role: "user"
                        });
                    }
                    return true;
                } catch (error) {
                    console.error("Error saving user", error);
                    return false;
                }
            }
            return true;
        },
        async session({ session, token }: any) {
            // Add user ID to session from DB
            await connectToDB();
            const dbUser = await User.findOne({ email: session.user.email });
            if (dbUser) {
                session.user.id = dbUser._id.toString();
                session.user.role = dbUser.role;
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
            }
            return token;
        }
    },
    pages: {
        signIn: '/login',
        error: '/auth/error',
    },
    secret: process.env.NEXTAUTH_SECRET || "super_secret_fallback_key",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
