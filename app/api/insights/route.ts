import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Calculation from "@/models/Calculation";
import Insight from "@/models/Insight";
import { getUserId } from "@/lib/auth/getUserId";
import { rateLimiter } from "@/lib/security/rateLimiter";
import { z } from "zod";

const insightUpdateSchema = z.object({
    insightId: z.string(),
    dismissed: z.boolean().optional()
});

/**
 * Generate insights based on emission patterns
 */
import OpenAI from "openai";

// Initialize OpenAI, but allow failure if key is missing
let openai: OpenAI | null = null;
try {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    } else {
        console.warn("OPENAI_API_KEY is not set. Using fallback insights.");
    }
} catch (e) {
    console.error("Failed to initialize OpenAI:", e);
}


/**
 * Generate insights based on emission patterns using OpenAI if available
 */
async function generateInsights(calculations: any[]): Promise<Array<{ type: string; category: string; title: string; description: string; impact: string; actionable: boolean; priority: string; relatedData?: any }>> {
    const insights: any[] = [];

    if (calculations.length === 0) return insights;

    // --- STANDARD RULE-BASED INSIGHTS (FALLBACK / BASELINE) ---
    // Category analysis
    const categoryTotals: Record<string, number> = {};
    calculations.forEach(calc => {
        categoryTotals[calc.type] = (categoryTotals[calc.type] || 0) + calc.emissions;
    });

    const totalEmissions = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    // Insight 1: Highest emission source
    if (sortedCategories.length > 0) {
        const [topCategory, topEmissions] = sortedCategories[0];
        const percentage = (topEmissions / totalEmissions * 100).toFixed(1);

        insights.push({
            type: "analysis",
            category: "emissions",
            title: `${topCategory} is your largest emission source`,
            description: `${topCategory} accounts for ${percentage}% of your total emissions (${topEmissions.toFixed(2)} tCO2e). Focus reduction strategies here.`,
            impact: "high",
            actionable: true,
            priority: "high",
            relatedData: { category: topCategory, emissions: topEmissions, percentage }
        });
    }

    // Insight 2:Trend analysis (if we have recent data)
    const last7Days = calculations.filter(c => {
        const date = new Date(c.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return date >= sevenDaysAgo;
    });

    const prev7Days = calculations.filter(c => {
        const date = new Date(c.createdAt);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return date >= fourteenDaysAgo && date < sevenDaysAgo;
    });

    if (last7Days.length > 0 && prev7Days.length > 0) {
        const recentEmissions = last7Days.reduce((sum, c) => sum + c.emissions, 0);
        const previousEmissions = prev7Days.reduce((sum, c) => sum + c.emissions, 0);
        const change = ((recentEmissions - previousEmissions) / previousEmissions * 100);

        if (Math.abs(change) > 10) {
            insights.push({
                type: "trend",
                category: "analysis",
                title: change > 0 ? "Emissions increasing" : "Emissions decreasing",
                description: `Your emissions have ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% in the last week compared to the previous week.`,
                impact: Math.abs(change) > 25 ? "high" : "medium",
                actionable: true,
                priority: Math.abs(change) > 25 ? "high" : "medium",
                relatedData: { change, recentEmissions, previousEmissions }
            });
        }
    }

    // Insight 3: Optimization opportunity
    if (sortedCategories.length > 1) {
        const [, secondEmissions] = sortedCategories[1];
        if (secondEmissions > totalEmissions * 0.2) {
            insights.push({
                type: "recommendation",
                category: "optimization",
                title: "Multiple high-emission sources detected",
                description: "Your emissions are distributed across multiple categories. Consider a multi-faceted approach to reduction.",
                impact: "medium",
                actionable: true,
                priority: "medium"
            });
        }
    }

    // Insight 4: Data quality
    if (calculations.length < 5) {
        insights.push({
            type: "info",
            category: "data_quality",
            title: "Limited data for analysis",
            description: "Add more calculations to get personalized insights and track your progress more accurately.",
            impact: "low",
            actionable: true,
            priority: "low"
        });
    }

    // --- AI-POWERED INSIGHTS ---
    if (openai && calculations.length > 0) {
        try {
            // Prepare summary for AI to reduce token usage
            const calcSummary = sortedCategories.map(([cat, val]) => `${cat}: ${val.toFixed(2)} tCO2e`).join(", ");
            const recentActivity = calculations.slice(0, 5).map(c => `${c.type} (${c.emissions.toFixed(2)})`).join(", ");

            const prompt = `
                Analyze the following carbon footprint data for a company:
                Total Emissions: ${totalEmissions.toFixed(2)} tCO2e
                Breakdown: ${calcSummary}
                Recent Activity: ${recentActivity}

                Generate 3 JSON actionable insights.
                1. One industry-standard recommendation.
                2. One innovative/creative problem-solving idea.
                3. One trend or warning if applicable.

                Format strictly as a JSON array of objects with keys:
                - type: "recommendation" | "trend" | "analysis"
                - category: "optimization" | "energy" | "transport" | "general"
                - title: Short punchy title
                - description: 1-2 sentence actionable advice
                - impact: "high" | "medium" | "low"
                - priority: "high" | "medium" | "low"
            `;

            const completion = await openai.chat.completions.create({
                messages: [{ role: "system", content: "You are an expert sustainability consultant." }, { role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
                response_format: { type: "json_object" }, // json_object requires "json" in prompt usually, or we parse manually.
                // Using text and manual parse is safer if model availability varies.
                // Let's standard text and regex parse or json mode if supported.
            });

            const content = completion.choices[0].message.content;
            if (content) {
                // OpenAI often wraps JSON in ```json ... ``` blocks
                const jsonStr = content.replace(/```json/g, "").replace(/```/g, "").trim();
                const aiInsights = JSON.parse(jsonStr);

                // Handle if it returns an object { "insights": [...] } or just array [...]
                const insightsList = Array.isArray(aiInsights) ? aiInsights : (aiInsights.insights || []);

                insightsList.forEach((i: any) => {
                    insights.push({
                        type: i.type || "recommendation",
                        category: i.category || "optimization",
                        title: i.title || "AI Insight",
                        description: i.description || "AI generated insight.",
                        impact: i.impact || "medium",
                        actionable: true,
                        priority: i.priority || "medium"
                    });
                });
            }

        } catch (error) {
            console.error("OpenAI Insight Generation Failed:", error);
            // Fallback: Add a generic recommendation if AI fails
            insights.push({
                type: "recommendation",
                category: "general",
                title: "Review your consumption patterns",
                description: "Regularly tracking and analyzing your emissions is the first step to reduction.",
                impact: "low",
                actionable: true,
                priority: "low"
            });
        }
    }

    return insights;
}

/**
 * GET /api/insights - Get insights for the current user
 */
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
        const category = url.searchParams.get("category");
        const dismissed = url.searchParams.get("dismissed") === "true";

        // Fetch stored insights
        let query: any = { userId };
        if (category) query.category = category;
        if (!dismissed) query.dismissed = false;

        const storedInsights = await Insight.find(query).sort({ priority: -1, createdAt: -1 }).lean();

        return NextResponse.json({ success: true, insights: storedInsights });
    } catch (error: any) {
        console.error("Insights API GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
    }
}

/**
 * POST /api/insights - Generate new insights
 */
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

        // Fetch user calculations
        const calculations = await Calculation.find({ userId }).sort({ createdAt: -1 }).limit(100).lean();

        // Generate insights
        const generatedInsights = await generateInsights(calculations);

        // Save new insights (avoiding duplicates)
        const savedInsights = [];
        for (const insight of generatedInsights) {
            const existing = await Insight.findOne({
                userId,
                title: insight.title,
                dismissed: false
            });

            if (!existing) {
                const saved = await Insight.create({
                    userId,
                    ...insight
                });
                savedInsights.push(saved);
            }
        }

        return NextResponse.json({
            success: true,
            insights: savedInsights,
            message: `Generated ${savedInsights.length} new insights`
        });
    } catch (error: any) {
        console.error("Insights API POST Error:", error);
        return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
    }
}

/**
 * PUT /api/insights - Update an insight (e.g., dismiss)
 */
export async function PUT(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = await rateLimiter(ip, { windowMs: 15 * 60 * 1000, maxRequests: 30 });
        if (!rateLimit.success) {
            return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
        }

        await connectToDB();

        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const validation = insightUpdateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
        }

        const { insightId, dismissed } = validation.data;

        if (!insightId) {
            return NextResponse.json({ error: "Insight ID is required" }, { status: 400 });
        }

        const insight = await Insight.findOne({ _id: insightId, userId });
        if (!insight) {
            return NextResponse.json({ error: "Insight not found" }, { status: 404 });
        }

        if (typeof dismissed === 'boolean') {
            insight.dismissed = dismissed;
        }

        await insight.save();

        return NextResponse.json({ success: true, insight, message: "Insight updated successfully!" });
    } catch (error: any) {
        console.error("Insights API PUT Error:", error);
        return NextResponse.json({ error: "Failed to update insight" }, { status: 500 });
    }
}
