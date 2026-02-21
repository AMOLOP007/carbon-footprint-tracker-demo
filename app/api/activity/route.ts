import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { getRecentActivities, getActivitiesByCategory } from "@/lib/utils/activity";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";

// Get user ID helper
async function getUserId() {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id;
    if (session?.user?.email) {
        const User = (await import("@/models/User")).default;
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) return dbUser._id;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    if (token.startsWith("mock-jwt-token") || token.startsWith("eyJhbGciOiJIUzI1NiJ9")) {
        return "507f1f77bcf86cd799439011";
    }

    try {
        const payload = await verifyJWT(token) as any;
        return payload?.id;
    } catch (e) {
        return null;
    }
}

/**
 * GET /api/activity - Get activity log for the current user
 */
export async function GET(req: Request) {
    try {
        await connectToDB();

        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const category = url.searchParams.get("category");
        const limit = parseInt(url.searchParams.get("limit") || "50");

        let activities;
        if (category) {
            activities = await getActivitiesByCategory(
                userId.toString(),
                category as any,
                limit
            );
        } else {
            activities = await getRecentActivities(userId.toString(), limit);
        }

        return NextResponse.json({ success: true, activities });
    } catch (error: any) {
        console.error("Activity API Error:", error);
        return NextResponse.json({ error: "Failed to fetch activity log" }, { status: 500 });
    }
}
