import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Calculation from "@/models/Calculation";
import Report from "@/models/Report";
import AIAnalysis from "@/models/AIAnalysis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { logActivity } from "@/lib/utils/activity";

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
 * GET /api/data - Get all emission records for the current user
 */
export async function GET(req: Request) {
    try {
        await connectToDB();

        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const type = url.searchParams.get("type");
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        const limit = parseInt(url.searchParams.get("limit") || "100");

        let query: any = { userId };

        if (type) {
            query.type = type;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const [calculations, reports, aiAnalysis] = await Promise.all([
            Calculation.find(query).sort({ createdAt: -1 }).limit(limit).lean(),
            Report.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean(),
            AIAnalysis.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean()
        ]);

        return NextResponse.json({ success: true, calculations, reports, aiAnalysis });
    } catch (error: any) {
        console.error("Data API GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

/**
 * PUT/api/data - Update an emission record
 */
export async function PUT(req: Request) {
    try {
        await connectToDB();

        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { calculationId, inputs, emissions } = body;

        if (!calculationId) {
            return NextResponse.json({ error: "Calculation ID is required" }, { status: 400 });
        }

        // Find and update calculation
        const calculation = await Calculation.findOne({ _id: calculationId, userId });
        if (!calculation) {
            return NextResponse.json({ error: "Calculation not found" }, { status: 404 });
        }

        if (inputs) calculation.inputs = inputs;
        if (typeof emissions === 'number') calculation.emissions = emissions;

        await calculation.save();

        // Log activity
        logActivity({
            userId: userId.toString(),
            action: `Updated ${calculation.type} calculation`,
            category: "data_management",
            metadata: {
                calculationId: calculation._id.toString(),
            },
        }).catch(err => console.error("Activity logging failed:", err));

        return NextResponse.json({
            success: true,
            calculation,
            message: "Calculation updated successfully!"
        });
    } catch (error: any) {
        console.error("Data API PUT Error:", error);
        return NextResponse.json({ error: "Failed to update calculation" }, { status: 500 });
    }
}

/**
 * DELETE /api/data - Delete an emission record
 */
export async function DELETE(req: Request) {
    try {
        await connectToDB();

        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const calculationId = url.searchParams.get("calculationId");

        if (!calculationId) {
            return NextResponse.json({ error: "Calculation ID is required" }, { status: 400 });
        }

        // Find and delete calculation
        const calculation = await Calculation.findOneAndDelete({ _id: calculationId, userId });
        if (!calculation) {
            return NextResponse.json({ error: "Calculation not found" }, { status: 404 });
        }

        // Log activity
        logActivity({
            userId: userId.toString(),
            action: `Deleted ${calculation.type} calculation`,
            category: "data_management",
            metadata: {
                calculationType: calculation.type,
                emissions: calculation.emissions,
            },
        }).catch(err => console.error("Activity logging failed:", err));

        return NextResponse.json({ success: true, message: "Calculation deleted successfully!" });
    } catch (error: any) {
        console.error("Data API DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete calculation" }, { status: 500 });
    }
}
