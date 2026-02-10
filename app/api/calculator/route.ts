import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Calculation from "@/models/Calculation";
import { verifyJWT } from "@/lib/auth"; // Need to ensure this exists or create it
import { cookies } from "next/headers";

// Mock User ID getter if auth not fully wired
import { getServerSession } from "next-auth"; // Import NextAuth session
import { authOptions } from "../auth/[...nextauth]/route";

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
        const mongoose = await connectToDB();

        if (!mongoose) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 503 });
        }

        const userId = await getUserId();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { type, inputs, emissions } = body;

        // Ensure we don't start a DB op if not ready
        if (mongoose.connection.readyState !== 1) {
            // Wait up to 2 seconds for connection to be ready
            for (let i = 0; i < 5; i++) {
                await new Promise(resolve => setTimeout(resolve, 400));
                if (mongoose.connection.readyState === 1) break;
            }

            // Final check
            if (mongoose.connection.readyState !== 1) {
                return NextResponse.json({ error: "Database not ready" }, { status: 503 });
            }
        }

        // Save new calculation with explicit await
        const calculation = await Calculation.create({
            userId,
            type, // Enum validation happens here
            inputs,
            emissions
        });

        return NextResponse.json({ success: true, calculation });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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
