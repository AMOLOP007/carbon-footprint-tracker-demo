import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimiter } from "@/lib/security/rateLimiter";

const registerSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters").max(100)
});

export async function POST(req: Request) {
    try {
        // Rate limiting based on IP (Fallback to generic if ip header missing)
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = await rateLimiter(ip, { windowMs: 15 * 60 * 1000, maxRequests: 5 }); // 5 regs per 15 mins
        if (!rateLimit.success) {
            return NextResponse.json({ message: "Too many requests. Try again later." }, { status: 429 });
        }

        await connectToDB();

        const body = await req.json();

        // 1. Strict Input Validation via Zod
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ message: result.error.errors[0].message }, { status: 400 });
        }

        const { name, email, password } = result.data;

        // 2. Check for existing user
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists with this email" }, { status: 400 });
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4. Create User
        await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
            provider: "credentials",
            role: "user"
        });

        // 5. Return success (No token, Require login)
        return NextResponse.json({
            success: true,
            message: "Registration successful. Please log in."
        }, { status: 201 });

    } catch (error: any) {
        console.error("Registration critical error:", error.message || error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
