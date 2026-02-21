import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Calculation from "@/models/Calculation";
import { cache } from "@/lib/db/cache";
import { rateLimiter } from "@/lib/security/rateLimiter";
import { getUserId } from "@/lib/auth/getUserId";
import { z } from "zod";

const calcSchema = z.object({
    type: z.enum(["electricity", "vehicle", "shipping", "supply", "supply_chain"]),
    inputs: z.record(z.any()),
    emissions: z.number().min(0)
});

export async function POST(req: Request) {
    try {
        // Rate limiting
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = await rateLimiter(ip, { windowMs: 60 * 1000, maxRequests: 20 });
        if (!rateLimit.success) {
            return NextResponse.json({ message: "Too many requests. Try again later." }, { status: 429 });
        }

        await connectToDB();

        const userId = await getUserId();

        if (!userId) {
            return NextResponse.json({
                error: "Please log in to save calculations."
            }, { status: 401 });
        }

        const body = await req.json();
        const result = calcSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: "Invalid payload: " + result.error.errors[0].message }, { status: 400 });
        }

        const { type, inputs, emissions } = result.data;

        // Normalize 'supply' to 'supply_chain' for database consistency
        const normalizedType = type === 'supply' ? 'supply_chain' : type;

        // Save to database
        const calculation = await Calculation.create({
            userId,
            type: normalizedType,
            inputs,
            emissions,
        });

        // Log activity
        const { logActivity } = await import("@/lib/utils/activity");
        logActivity({
            userId: userId.toString(),
            action: `Created ${type} calculation`,
            category: "calculation",
            metadata: {
                calculationId: calculation._id.toString(),
                emissions,
            },
        }).catch(() => { });

        return NextResponse.json(
            {
                success: true,
                calculation,
                message: "Calculation saved successfully!",
                refreshDashboard: true
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("[SAVE API] ❌ CRITICAL ERROR CAUGHT", error.message || error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}

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

        let query: any = { userId };
        if (type) query.type = type;

        const calculations = await Calculation.find(query).sort({ createdAt: -1 }).limit(10);

        return NextResponse.json({ success: true, calculations });

    } catch (error: any) {
        console.error("Calculator API Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
