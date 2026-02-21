import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Calculation from "@/models/Calculation";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { cache } from "@/lib/db/cache";
import { rateLimiter } from "@/lib/security/rateLimiter";
import { z } from "zod";

const calcSchema = z.object({
    type: z.enum(["electricity", "vehicle", "shipping", "supply", "supply_chain"]),
    inputs: z.record(z.any()),
    emissions: z.number().min(0)
});

// Mock User ID getter if auth not fully wired
async function getUserId() {
    // 1. Check NextAuth Session (Social Login)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
        return session.user.id;
    }
    // Also check email if ID not explicitly in session type (fallback)
    if (session?.user?.email) {
        // We might need to fetch user from DB if ID is missing in session object but email exists
        const User = (await import("@/models/User")).default; // Dynamic import to avoid circular deps if any
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) return dbUser._id;
    }

    // 2. Check Custom JWT Cookie (Legacy/Email Auth)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    try {
        const payload = await verifyJWT(token) as any;
        return payload?.id;
    } catch (e) {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        // Rate limiting
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = rateLimiter(ip, { windowMs: 60 * 1000, maxRequests: 20 });
        if (!rateLimit.success) {
            return NextResponse.json({ message: "Too many requests. Try again later." }, { status: 429 });
        }

        // Ensure DB connection is established with proper await
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

        // Validations passed
        if (!userId) {
            return NextResponse.json({ message: "User ID not found" }, { status: 401 });
        }

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
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
