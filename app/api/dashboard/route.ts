import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Calculation from "@/models/Calculation";
import Goal from "@/models/Goal";
import { cache } from "@/lib/db/cache";
import { getUserId } from "@/lib/auth/getUserId";
import { rateLimiter } from "@/lib/security/rateLimiter";

/**
 * GET /api/dashboard
 * Compute and return real-time dashboard metrics from user's calculations
 * Cached for 60 seconds for performance
 */
export async function GET(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = await rateLimiter(ip, { windowMs: 60 * 1000, maxRequests: 60 });
        if (!rateLimit.success) {
            return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
        }

        // Attempt DB connection with timeout
        const dbConnectionPromise = connectToDB();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database connection timeout')), 8000)
        );

        try {
            await Promise.race([dbConnectionPromise, timeoutPromise]);
        } catch (dbError) {
            console.error('Database connection failed:', dbError);
            // Return graceful fallback instead of crashing
            return NextResponse.json({
                success: true,
                data: {
                    totalEmissions: 0,
                    monthlyEmissions: 0,
                    reductionPercentage: 0,
                    totalCalculations: 0,
                    sustainabilityScore: 0,
                    hasData: false,
                    categoryBreakdown: {},
                    trendData: [],
                    goalsProgress: []
                },
                fallback: true,
                message: "Using fallback data - database temporarily unavailable"
            });
        }

        const userId = await getUserId();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check cache first
        const cacheKey = `dashboard:${userId}`;
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            return NextResponse.json({ success: true, data: cachedData, cached: true });
        }

        // Use aggregation pipeline for better performance
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Parallel queries for performance with error handling
        const [calculations, goals, categoryStats, weeklyStats] = await Promise.all([
            // Basic calculations for overall totals
            Calculation.find({ userId }).select('emissions createdAt type').lean().limit(1000).catch(() => []),

            // Goals data
            Goal.find({ userId, status: { $in: ["active", "completed"] } })
                .select('title baseline target current deadline status')
                .sort({ deadline: 1 })
                .lean()
                .catch(() => []),

            // Category breakdown using aggregation
            Calculation.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: "$type",
                        total: { $sum: "$emissions" }
                    }
                }
            ]).catch(() => []),

            // Weekly trend using aggregation
            Calculation.aggregate([
                { $match: { userId, createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        emissions: { $sum: "$emissions" }
                    }
                },
                { $sort: { _id: 1 } }
            ]).catch(() => [])
        ]);

        // Compute metrics efficiently
        const totalEmissions = calculations.reduce((sum, calc) => sum + (calc.emissions || 0), 0);

        const recentCalculations = calculations.filter(
            (calc) => new Date(calc.createdAt) >= thirtyDaysAgo
        );
        const monthlyEmissions = recentCalculations.reduce((sum, calc) => sum + (calc.emissions || 0), 0);

        const previousMonthCalcs = calculations.filter(
            (calc) => new Date(calc.createdAt) >= sixtyDaysAgo && new Date(calc.createdAt) < thirtyDaysAgo
        );
        const previousMonthEmissions = previousMonthCalcs.reduce((sum, calc) => sum + (calc.emissions || 0), 0);

        const reductionPercentage = previousMonthEmissions > 0
            ? ((previousMonthEmissions - monthlyEmissions) / previousMonthEmissions) * 100
            : 0;

        // Category breakdown from aggregation
        const categoryBreakdown: Record<string, number> = {};
        categoryStats.forEach((stat) => {
            if (stat._id) {
                categoryBreakdown[stat._id] = stat.total;
            }
        });

        // Trend data from aggregation
        const trendData = weeklyStats.map((stat) => ({
            date: stat._id,
            emissions: stat.emissions,
        }));

        // Goals progress
        const goalsProgress = goals.map((goal) => {
            const progress = goal.baseline && goal.target
                ? ((goal.baseline - goal.current) / goal.baseline) * 100
                : (goal.current / goal.target) * 100;

            return {
                id: goal._id,
                title: goal.title,
                progress: Math.min(Math.max(progress, 0), 100),
                target: goal.target,
                current: goal.current,
                deadline: goal.deadline,
                status: goal.status,
            };
        });

        // Calculate sustainability score (0-100)
        let sustainabilityScore = 50; // Base score

        if (reductionPercentage > 0) {
            sustainabilityScore += Math.min(reductionPercentage, 30);
        } else {
            sustainabilityScore -= Math.abs(Math.min(reductionPercentage, -30));
        }

        const completedGoals = goals.filter(g => g.status === "completed").length;
        sustainabilityScore += completedGoals * 5;

        sustainabilityScore = Math.min(Math.max(sustainabilityScore, 0), 100);

        const responseData = {
            totalEmissions: Math.round(totalEmissions * 100) / 100,
            monthlyEmissions: Math.round(monthlyEmissions * 100) / 100,
            reductionPercentage: Math.round(reductionPercentage * 100) / 100,
            sustainabilityScore: Math.round(sustainabilityScore),
            categoryBreakdown,
            trendData,
            goalsProgress,
            totalCalculations: calculations.length,
            recentCalculationsCount: recentCalculations.length,
            hasData: calculations.length > 0,
        };

        // Cache for 60 seconds
        cache.set(cacheKey, responseData, 60);

        return NextResponse.json({
            success: true,
            data: responseData,
            cached: false,
        });
    } catch (error: any) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({
            error: "Failed to load dashboard data"
        }, { status: 500 });
    }
}
