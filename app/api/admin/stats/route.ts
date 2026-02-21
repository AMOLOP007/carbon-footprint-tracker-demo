import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import Calculation from "@/models/Calculation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { rateLimiter } from "@/lib/security/rateLimiter";

export async function GET(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = await rateLimiter(ip, { windowMs: 15 * 60 * 1000, maxRequests: 50 });
        if (!rateLimit.success) {
            return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
        }

        await connectToDB();

        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const userCount = await User.countDocuments();
        const calculationCount = await Calculation.countDocuments();

        // Aggregate last 5 signups (privacy safe, just dates/roles)
        const recentSignups = await User.find({}, 'role createdAt provider').sort({ createdAt: -1 }).limit(5);

        return NextResponse.json({
            success: true,
            stats: {
                total_users: userCount,
                total_calculations: calculationCount,
                recent_activity: recentSignups
            },
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("Admin Stats API Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
