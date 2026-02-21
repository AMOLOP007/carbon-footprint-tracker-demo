import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

/**
 * A centralized, secure utility to retrieve the authenticated user's ID.
 * Exclusively uses NextAuth's getServerSession.
 * It strictly forbids mock JWTs, debug tokens, and hardcoded fallbacks.
 * 
 * @returns {Promise<string | null>} The verified user ID, or null if unauthorized.
 */
export async function getUserId(): Promise<string | null> {
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.id) {
            return session.user.id;
        }

        // Even if session.user.email exists, NextAuth options.ts JWT callback 
        // should already map the DB _id to token.id -> session.user.id.
        // We do not fallback to custom cookie parsing. All dynamic/custom 
        // authentication is removed to ensure a single source of truth.

        return null;
    } catch (error) {
        console.error("Error securely fetching user ID:", error);
        return null;
    }
}
