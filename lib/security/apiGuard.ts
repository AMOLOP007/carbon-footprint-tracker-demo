import { NextResponse } from "next/server";
import { rateLimiter, RateLimitOptions } from "./rateLimiter";
import { getUserId } from "@/lib/auth/getUserId";

interface ApiGuardOptions {
    requireAuth?: boolean;
    rateLimit?: RateLimitOptions;
    allowedMethods?: string[];
    // Strict origin validation for mutations
    enforceOrigin?: boolean;
}

/**
 * Reusable Safe API Gatekeeper.
 * Provides unified session validation, rate limiting, and origin checks.
 * Does NOT rewrite existing logic; simply call at the top of route handlers.
 */
export async function apiGuard(req: Request, options: ApiGuardOptions = {}) {
    const {
        requireAuth = false,
        rateLimit = null,
        allowedMethods = ["GET", "POST", "PUT", "DELETE"],
        enforceOrigin = true
    } = options;

    // 1. Method checking
    if (!allowedMethods.includes(req.method)) {
        return { success: false, response: NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }) };
    }

    // 2. Strict Origin/Referer check for mutations to prevent CSRF
    if (enforceOrigin && ["POST", "PUT", "DELETE"].includes(req.method)) {
        const origin = req.headers.get("origin");
        const referer = req.headers.get("referer");
        const host = req.headers.get("host");

        const isLocalhost = (val: string) => val && (val.includes("localhost") || val.includes("127.0.0.1"));

        // Strict origin matching for cross-site forgery protection
        if (origin) {
            const allowedOrigin = host ? `http://${host}` : null;
            const allowedSecureOrigin = host ? `https://${host}` : null;
            if (origin !== allowedOrigin && origin !== allowedSecureOrigin && !isLocalhost(origin)) {
                return { success: false, response: NextResponse.json({ error: "Forbidden cross-origin request" }, { status: 403 }) };
            }
        } else if (referer) {
            try {
                const refHost = new URL(referer).host;
                if (refHost !== host && !isLocalhost(refHost)) {
                    return { success: false, response: NextResponse.json({ error: "Forbidden cross-origin request" }, { status: 403 }) };
                }
            } catch {
                return { success: false, response: NextResponse.json({ error: "Invalid referer" }, { status: 403 }) };
            }
        }
    }

    // 3. Optional centralized Auth Check
    let userId: string | null = null;
    if (requireAuth) {
        userId = await getUserId();
        if (!userId) {
            return { success: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
        }
    }

    // 4. Rate Limiting
    if (rateLimit) {
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const limitResult = await rateLimiter(ip, rateLimit);
        if (!limitResult.success) {
            return { success: false, response: NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 }) };
        }
    }

    return { success: true, userId };
}
