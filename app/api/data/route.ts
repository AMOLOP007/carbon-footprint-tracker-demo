import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Calculation from "@/models/Calculation";
import Report from "@/models/Report";
import AIAnalysis from "@/models/AIAnalysis";
import { logActivity } from "@/lib/utils/activity";
import { getUserId } from "@/lib/auth/getUserId";
import { rateLimiter } from "@/lib/security/rateLimiter";
import { z } from "zod";

const emissionUpdateSchema = z.object({
    calculationId: z.string(),
    updates: z.object({
        inputs: z.record(z.any()).optional(),
        emissions: z.number().min(0).optional()
    })
});

/**
 * GET /api/data - Get all emission records for the current user
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
        const type = url.searchParams.get("type");
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "100", 10), 1), 500);

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
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = await rateLimiter(ip, { windowMs: 15 * 60 * 1000, maxRequests: 30 });
        if (!rateLimit.success) {
            return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
        }

        await connectToDB();

        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = emissionUpdateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
        }

        const { calculationId, updates } = validation.data;
        const inputs = updates.inputs;
        const emissions = updates.emissions;

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
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = await rateLimiter(ip, { windowMs: 15 * 60 * 1000, maxRequests: 20 });
        if (!rateLimit.success) {
            return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
        }

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
