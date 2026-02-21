import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import AIAnalysis from "@/models/AIAnalysis";
import Calculation from "@/models/Calculation";
import Report from "@/models/Report";
import Goal from "@/models/Goal";
import { generateSustainabilityAnalysis } from "@/lib/ai/openaiService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";

import { getUserId } from "@/lib/auth/getUserId";

import { rateLimiter } from "@/lib/security/rateLimiter";

export async function POST(req: Request) {
    try {
        // Rate limiting
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = await rateLimiter(ip, { windowMs: 60 * 60 * 1000, maxRequests: 5 }); // strict limit for expensive AI operation
        if (!rateLimit.success) {
            return NextResponse.json({ message: "Too many requests. Try again later." }, { status: 429 });
        }

        await connectToDB();
        const userId = await getUserId();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch User Data
        const calculations = await Calculation.find({ userId }).sort({ createdAt: -1 }).limit(100).lean();
        const recentReports = await Report.find({ userId }).sort({ createdAt: -1 }).limit(3).lean();
        const goals = await Goal.find({ userId }).lean();

        // 2. Aggregate Data for AI
        const totalEmissions = calculations.reduce((sum, c) => sum + c.emissions, 0);
        const byCategory: any = {};
        calculations.forEach(c => {
            byCategory[c.type] = (byCategory[c.type] || 0) + c.emissions;
        });

        // Simple trend: Last 5 calc vs previous 5 (mock logic for prompt)
        const trends = {
            recentTotal: calculations.slice(0, 5).reduce((sum, c) => sum + c.emissions, 0),
            trendDirection: "stable" // This would be calculated more robustly in real app
        };

        const emissionsData = {
            total: totalEmissions,
            byCategory,
            trends
        };

        // 3. Generate Analysis
        const analysisResult = await generateSustainabilityAnalysis(emissionsData, recentReports, goals);

        if (!analysisResult) {
            return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
        }

        // 4. Save to DB
        const savedAnalysis = await AIAnalysis.create({
            userId,
            ...analysisResult,
            createdAt: new Date()
        });

        return NextResponse.json({ success: true, analysis: savedAnalysis });

    } catch (error: any) {
        console.error("AI Generation API Error:", error);
        console.error("Stack Trace:", error.stack);

        // Check for specific OpenAI errors
        if (error.response) {
            console.error("OpenAI API Status:", error.response.status);
            console.error("OpenAI API Data:", error.response.data);
        }

        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await connectToDB();
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch latest analysis
        const analysis = await AIAnalysis.findOne({ userId }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, analysis });

    } catch (error: any) {
        console.error("AI Generation API Error:", error);
        console.error("Stack Trace:", error.stack);

        // Check for specific OpenAI errors
        if (error.response) {
            console.error("OpenAI API Status:", error.response.status);
            console.error("OpenAI API Data:", error.response.data);
        }

        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}
