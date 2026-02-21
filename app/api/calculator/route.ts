import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Calculation from "@/models/Calculation";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { cache } from "@/lib/db/cache";


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

    // For demo/hardcoded user
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

export async function POST(req: Request) {
    try {
        // Ensure DB connection is established with proper await
        await connectToDB();

        const userId = await getUserId();

        if (!userId) {
            return NextResponse.json({
                error: "Please log in to save calculations."
            }, { status: 401 });
        }

        const body = await req.json();
        const { type, inputs, emissions } = body;

        // Validate required fields
        if (!type) {
            console.error('[SAVE API] ✗ ERROR: Type missing');
            return NextResponse.json({
                error: "Calculation type is required."
            }, { status: 400 });
        }

        if (!inputs || typeof inputs !== 'object') {
            console.error('[SAVE API] ✗ ERROR: Inputs missing or invalid:', inputs);
            return NextResponse.json({
                error: "Calculation inputs are required."
            }, { status: 400 });
        }

        if (typeof emissions !== 'number' || emissions < 0) {
            console.error('[SAVE API] ✗ ERROR: Invalid emissions value:', emissions, 'Type:', typeof emissions);
            return NextResponse.json({
                error: "Valid emissions value is required."
            }, { status: 400 });
        }
        console.log('[SAVE API] ✓ All validations passed');

        // Validate type enum against Calculation model - ACCEPT BOTH supply and supply_chain
        const validTypes = ["electricity", "vehicle", "shipping", "supply", "supply_chain"];
        if (!validTypes.includes(type)) {
            console.error('[SAVE ERROR] Invalid type:', type, 'Valid types:', validTypes);
            return NextResponse.json({
                error: `Invalid calculation type "${type}". Must be one of: ${validTypes.join(", ")}.`
            }, { status: 400 });
        }

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
        console.error("==========================================");
        console.error("[SAVE API] ❌ CRITICAL ERROR CAUGHT");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error stack:", error.stack);
        console.error("Full error object:", JSON.stringify(error, null, 2));
        console.error("==========================================");

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            console.error('[SAVE API] Validation errors:', messages);
            return NextResponse.json({
                error: `Validation error: ${messages.join(', ')}`
            }, { status: 400 });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            console.error('[SAVE API] Duplicate key error');
            return NextResponse.json({
                error: "This calculation already exists."
            }, { status: 409 });
        }

        // Return detailed error for debugging
        return NextResponse.json({
            error: "Failed to save calculation. Please try again.",
            details: error.message,
            errorType: error.name
        }, { status: 500 });
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
