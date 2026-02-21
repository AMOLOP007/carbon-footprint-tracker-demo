import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { getRecentActivities, getActivitiesByCategory } from "@/lib/utils/activity";
import { getUserId } from "@/lib/auth/getUserId";
import { rateLimiter } from "@/lib/security/rateLimiter";

/**
 * GET /api/activity - Get activity log for the current user
 */
export async function GET(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = await rateLimiter(ip, { windowMs: 60 * 1000, maxRequests: 60 });
        if (!rateLimit.success) {
            return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
        }

        await connectToDB();

        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const category = url.searchParams.get("category");
        const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10), 1), 500);

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
