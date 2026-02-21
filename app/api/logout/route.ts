import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/logout - Clear session and cookies
 */
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();

        // Clear all authentication cookies
        cookieStore.delete("token");
        cookieStore.delete("next-auth.session-token");
        cookieStore.delete("__Secure-next-auth.session-token");
        cookieStore.delete("next-auth.csrf-token");
        cookieStore.delete("__Host-next-auth.csrf-token");



        return NextResponse.json({
            success: true,
            message: "Logged out successfully",
            redirect: "/login"
        });
    } catch (error: any) {
        console.error("Logout API Error:", error);
        return NextResponse.json({
            error: "Logout failed"
        }, { status: 500 });
    }
}
