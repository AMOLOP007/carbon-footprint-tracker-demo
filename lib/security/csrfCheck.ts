import { NextResponse } from "next/server";

/**
 * Validates the Origin/Referer header to protect against cross-site request forgery.
 * Returns a 403 response if the origin doesn't match the expected host.
 * Returns null if the origin is valid (request should proceed).
 */
export function checkCsrfOrigin(req: Request): NextResponse | null {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const host = req.headers.get("host");

    // Allow requests with no origin (e.g., same-origin, server-to-server)
    if (!origin && !referer) {
        return null;
    }

    const allowedOrigin = host ? `http://${host}` : null;
    const allowedSecureOrigin = host ? `https://${host}` : null;

    if (origin) {
        if (origin === allowedOrigin || origin === allowedSecureOrigin) {
            return null;
        }
        // Also allow localhost variants for dev
        if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
            return null;
        }
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    if (referer) {
        try {
            const refererUrl = new URL(referer);
            if (refererUrl.host === host) {
                return null;
            }
            if (refererUrl.hostname === "localhost" || refererUrl.hostname === "127.0.0.1") {
                return null;
            }
        } catch {
            // Invalid referer URL
        }
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    return null;
}
