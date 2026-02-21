import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Report from "@/models/Report";
import Calculation from "@/models/Calculation";
import AIAnalysis from "@/models/AIAnalysis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";

async function getUserId() {
    // 1. Try NextAuth Session (Standard Production Path)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
        console.log("[AUTH DEBUG] Session found via NextAuth:", session.user.id);
        return session.user.id;
    }

    // 2. Fallback to custom token cookie (Legacy / Demo / Mock)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log("[AUTH DEBUG] NextAuth failed. Checking custom token:", !!token);

    if (token) {
        // For demo/hardcoded user
        if (token.startsWith("mock-jwt-token") || token.startsWith("eyJhbGciOiJIUzI1NiJ9")) {
            return "507f1f77bcf86cd799439011";
        }

        try {
            const payload = await verifyJWT(token) as any;
            return payload?.id;
        } catch (e) {
            console.error("[AUTH DEBUG] JWT Verification failed:", e);
        }
    }

    return null;
}

export async function POST(req: Request) {
    try {
        await connectToDB();
        const userId = await getUserId();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const { customReportData } = body;

        let reportData: any;

        if (customReportData) {
            // Case 1: Saving a specific downloaded report (e.g. from Calculator)
            reportData = {
                userId,
                title: customReportData.title || `Report - ${new Date().toLocaleDateString()}`,
                summary: customReportData.summary || "Custom Report",
                dataSnapshot: customReportData.dataSnapshot,
                type: "pdf", // default
                period: {
                    startDate: new Date(),
                    endDate: new Date()
                }
            };
        } else {
            // Case 2: Generating a general summary report (existing logic)
            // Fetch recent calculations to summarize
            const recentCalcs = await Calculation.find({ userId }).sort({ createdAt: -1 }).limit(50);

            let totalEmissions = 0;
            let byType: any = {};

            recentCalcs.forEach(c => {
                totalEmissions += c.emissions;
                byType[c.type] = (byType[c.type] || 0) + c.emissions;
            });

            // Generate Summaries
            const summary = `Total Emissions: ${totalEmissions.toFixed(2)} tCO2e. Top source: ${Object.keys(byType).sort((a, b) => byType[b] - byType[a])[0] || 'None'}.`;

            // Fetch latest AI Analysis
            const latestAnalysis = await AIAnalysis.findOne({ userId }).sort({ createdAt: -1 });

            reportData = {
                userId,
                title: `Carbon Report - ${new Date().toLocaleDateString()}`,
                summary,
                dataSnapshot: { totalEmissions, byType, recentCalcs },
                aiInsightsSnapshot: latestAnalysis ? {
                    summary: latestAnalysis.summary,
                    recommendations: latestAnalysis.recommendations,
                    riskFlags: latestAnalysis.riskFlags,
                    innovativeIdea: latestAnalysis.innovativeIdea,
                } : undefined,
                type: "pdf",
                period: {
                    startDate: new Date(),
                    endDate: new Date()
                }
            };
        }

        if (customReportData && customReportData.aiInsightsSnapshot) {
            reportData.aiInsightsSnapshot = customReportData.aiInsightsSnapshot;
        }

        // Always try to attach latest AI analysis if not provided
        if (!reportData.aiInsightsSnapshot) {
            const latestAnalysis = await AIAnalysis.findOne({ userId }).sort({ createdAt: -1 });
            if (latestAnalysis) {
                reportData.aiInsightsSnapshot = {
                    summary: latestAnalysis.summary,
                    recommendations: latestAnalysis.recommendations,
                    riskFlags: latestAnalysis.riskFlags,
                    innovativeIdea: latestAnalysis.innovativeIdea,
                };
            }
        }

        // Explicitly set expiresAt to pass validation (90 days)
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
        reportData.expiresAt = ninetyDaysFromNow;

        const report = await Report.create(reportData);

        return NextResponse.json({ success: true, reportId: report._id });
    } catch (error: any) {
        console.error("API Error Creating Report:", error);
        return NextResponse.json({ error: error.message || "Failed to create report" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await connectToDB();
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const reports = await Report.find({ userId }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, reports });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
