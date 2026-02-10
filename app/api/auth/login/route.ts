import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        await connectToDB();

        // Mock mode fallback
        if (!mongoose.connection.readyState) {
            return NextResponse.json({
                success: true,
                token: "mock-jwt-token-login",
                user: { id: "mock-id", name: "Admin User", email: "admin@aetherra.com" }
            });
        }

        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
        }

        // --- HARDCODED DEMO USER FOR TESTING (User Request) ---
        if (email === "demo@aetherra.com" && password === "demo123") {
            const token = signToken({ id: "507f1f77bcf86cd799439011", email: "demo@aetherra.com" });
            return NextResponse.json({
                success: true,
                token,
                user: {
                    id: "507f1f77bcf86cd799439011",
                    name: "Demo Tester",
                    email: "demo@aetherra.com",
                    company: "Test Corp",
                    role: "Admin"
                },
            });
        }
        // ------------------------------------------------------

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const token = signToken({ id: user._id, email: user.email });

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                company: user.company,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
