import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        await connectToDB();

        const { name, email, password } = await req.json();

        // 1. Strict Input Validation
        if (!name || !name.trim()) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }
        if (!email || !email.includes("@")) {
            return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
        }
        if (!password || password.length < 8) {
            return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
        }

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
        console.error("Registration critical error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
