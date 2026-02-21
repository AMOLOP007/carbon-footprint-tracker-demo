import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that don't require authentication
const PUBLIC_PATHS = [
    "/splash",
    "/login",
    "/register",
    "/api/auth",
    "/_next",
    "/static",
    "/favicon.ico",
    "/icon",
    "/globals.css"
];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Check if the path is public
    const isPublic = PUBLIC_PATHS.some(path => pathname.startsWith(path));

    if (isPublic && !pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // Lightweight Bot & Abuse Protection for APIs
    if (pathname.startsWith("/api/")) {
        const userAgent = (req.headers.get("user-agent") || "").toLowerCase();
        if (!userAgent) {
            return NextResponse.json({ error: "Forbidden - Missing User-Agent" }, { status: 403 });
        }
        const blockedScrapers = ["python-requests", "sqlmap", "nikto", "nmap", "curl/", "wget/", "postmanruntime"];
        if (blockedScrapers.some(ua => userAgent.includes(ua))) {
            // Allow OAuth callbacks and webhooks, block data extraction
            if (!pathname.startsWith("/api/auth/")) {
                return NextResponse.json({ error: "Forbidden - Automated tool detected" }, { status: 403 });
            }
        }
    }

    if (isPublic) {
        return NextResponse.next();
    }

    // Check for NextAuth session token
    // getToken automatically handles encryption and cookie name (secure vs non-secure)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        // Redirect to splash if not authenticated
        // Use 307 Temporary Redirect to preserve method if needed, usually 307 for auth redirects
        return NextResponse.redirect(new URL("/splash", req.url));
    }

    // Allow request if authenticated
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
