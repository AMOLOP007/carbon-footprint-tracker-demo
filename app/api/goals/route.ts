import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Goal from "@/models/Goal";
import Calculation from "@/models/Calculation";
import { logActivity } from "@/lib/utils/activity";
import { getUserId } from "@/lib/auth/getUserId";
import { rateLimiter } from "@/lib/security/rateLimiter";
import { z } from "zod";

const milestoneSchema = z.object({
    title: z.string().max(100),
    target: z.number().min(0).optional(),
    completed: z.boolean().optional()
});

const goalSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    category: z.string().min(1).max(50),
    target: z.number().min(0),
    targetType: z.string().optional(),
    baseline: z.number().min(0).optional(),
    deadline: z.string().datetime().or(z.date()),
    status: z.enum(["active", "completed", "overdue"]).optional(),
    milestones: z.array(milestoneSchema).max(20).optional(),
    current: z.number().min(0).optional()
});

const goalUpdateSchema = goalSchema.partial();

/**
 * GET /api/goals - Get all goals for the current user
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
        const status = url.searchParams.get("status");

        let query: any = { userId };
        if (status) {
            query.status = status;
        }

        const goals = await Goal.find(query).sort({ deadline: 1 }).lean();

        return NextResponse.json({ success: true, goals });
    } catch (error: any) {
        console.error("Goals GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
    }
}

/**
 * POST /api/goals - Create a new goal
 */
export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = await rateLimiter(ip, { windowMs: 15 * 60 * 1000, maxRequests: 20 });
        if (!rateLimit.success) {
            return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
        }

        await connectToDB();

        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = goalSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
        }

        const { title, description, category, target, targetType, baseline, deadline, milestones } = validation.data;

        // Create goal
        const goal = await Goal.create({
            userId,
            title,
            description,
            category,
            target,
            targetType: targetType || "percentage",
            baseline,
            deadline: new Date(deadline),
            milestones: milestones || [],
            status: "active",
            current: 0,
        });

        // Log activity
        logActivity({
            userId: userId.toString(),
            action: `Created goal: ${title}`,
            category: "goal",
            metadata: {
                goalId: goal._id.toString(),
                goalCategory: category,
                target,
            },
        }).catch(err => console.error("Activity logging failed:", err));

        return NextResponse.json({
            success: true,
            goal,
            message: "Goal created successfully!"
        });
    } catch (error: any) {
        console.error("Goals POST Error:", error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json({
                error: `Validation error: ${messages.join(', ')}`
            }, { status: 400 });
        }

        return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
    }
}

/**
 * PUT /api/goals - Update a goal
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
        const { goalId } = body;

        const validation = goalUpdateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
        }
        const { title, description, target, targetType, baseline, deadline, status, current } = validation.data;

        if (!goalId) {
            return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
        }

        // Find and update goal
        const goal = await Goal.findOne({ _id: goalId, userId });
        if (!goal) {
            return NextResponse.json({ error: "Goal not found" }, { status: 404 });
        }

        // Safely update whitelisted fields
        if (title !== undefined) goal.title = title;
        if (description !== undefined) goal.description = description;
        if (target !== undefined) goal.target = target;
        if (current !== undefined) goal.current = current;
        if (deadline !== undefined) goal.deadline = new Date(deadline);
        if (status !== undefined && ["active", "completed", "overdue"].includes(status)) goal.status = status;

        // Auto-update status based on progress
        if (goal.current >= goal.target && goal.status === "active") {
            goal.status = "completed";
        } else if (new Date() > new Date(goal.deadline) && goal.status === "active") {
            goal.status = "overdue";
        }

        await goal.save();

        // Log activity
        logActivity({
            userId: userId.toString(),
            action: `Updated goal: ${goal.title}`,
            category: "goal",
            metadata: {
                goalId: goal._id.toString(),
                updates: Object.keys(body).filter(k => k !== 'goalId'),
            },
        }).catch(err => console.error("Activity logging failed:", err));

        return NextResponse.json({ success: true, goal, message: "Goal updated successfully!" });
    } catch (error: any) {
        console.error("Goals PUT Error:", error);
        return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
    }
}

/**
 * DELETE /api/goals - Delete a goal
 */
export async function DELETE(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = await rateLimiter(ip, { windowMs: 15 * 60 * 1000, maxRequests: 20 });
        if (!rateLimit.success) {
            return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
        }

        await connectToDB();

        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const goalId = url.searchParams.get("goalId");

        if (!goalId) {
            return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
        }

        // Find and delete goal
        const goal = await Goal.findOneAndDelete({ _id: goalId, userId });
        if (!goal) {
            return NextResponse.json({ error: "Goal not found" }, { status: 404 });
        }

        // Log activity
        logActivity({
            userId: userId.toString(),
            action: `Deleted goal: ${goal.title}`,
            category: "goal",
            metadata: {
                goalId: goal._id.toString(),
            },
        }).catch(err => console.error("Activity logging failed:", err));

        return NextResponse.json({ success: true, message: "Goal deleted successfully!" });
    } catch (error: any) {
        console.error("Goals DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
    }
}
