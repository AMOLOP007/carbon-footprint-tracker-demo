import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Report from "@/models/Report";
import Calculation from "@/models/Calculation";
import AIAnalysis from "@/models/AIAnalysis";
import { getUserId } from "@/lib/auth/getUserId";
import { rateLimiter } from "@/lib/security/rateLimiter";
import { z } from "zod";

const customReportSchema = z.object({
    title: z.string().max(200).optional(),
    summary: z.string().max(1000).optional(),
    dataSnapshot: z.any().optional(),
    aiInsightsSnapshot: z.any().optional()
}).optional();

export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = await rateLimiter(ip, { windowMs: 15 * 60 * 1000, maxRequests: 10 });
        if (!rateLimit.success) {
            return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
        }

        await connectToDB();
        const userId = await getUserId();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));

        let customReportData;
        if (body.customReportData) {
            const validation = customReportSchema.safeParse(body.customReportData);
            if (!validation.success) {
                return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
            }
            customReportData = validation.data;
        }

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
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const reports = await Report.find({ userId }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, reports });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
