import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key-change-me";

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const { pathname } = req.nextUrl;

    // Public paths
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/static") ||
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/splash" ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    // Check token
    if (!token) {
        // Redirect to splash for new users
        return NextResponse.redirect(new URL("/splash", req.url));
    }

    // Allow mock token for demo
    if (token.startsWith("mock-jwt-token") || token.startsWith("eyJhbGciOiJIUzI1NiJ9")) {
        return NextResponse.next();
    }

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.next();
    } catch (error) {
        // Redirect to splash if token is invalid
        return NextResponse.redirect(new URL("/splash", req.url));
    }
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
