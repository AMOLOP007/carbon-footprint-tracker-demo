import Activity from "@/models/Activity";
import { connectToDB } from "../db";

export interface ActivityData {
    userId: string;
    action: string;
    category: "calculation" | "report" | "goal" | "ai_chat" | "auth" | "settings" | "data_management";
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Log an activity to the database
 * This is a fire-and-forget operation - failures are logged but don't interrupt the main flow
 */
export async function logActivity(data: ActivityData): Promise<void> {
    try {
        await connectToDB();

        await Activity.create(data);

        console.log(`✅ Activity logged: ${data.action} (${data.category})`);
    } catch (error) {
        console.error("❌ Failed to log activity:", error);
        // Don't throw - activity logging should never break the main flow
    }
}

/**
 * Get recent activities for a user
 */
export async function getRecentActivities(userId: string, limit: number = 50) {
    try {
        await connectToDB();

        const activities = await Activity.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return activities;
    } catch (error) {
        console.error("Error fetching activities:", error);
        return [];
    }
}

/**
 * Get activities by category for a user
 */
export async function getActivitiesByCategory(
    userId: string,
    category: ActivityData["category"],
    limit: number = 50
) {
    try {
        await connectToDB();

        const activities = await Activity.find({ userId, category })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return activities;
    } catch (error) {
        console.error("Error fetching activities by category:", error);
        return [];
    }
}

/**
 * Get activity stats for a user
 */
export async function getActivityStats(userId: string) {
    try {
        await connectToDB();

        const stats = await Activity.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        return stats;
    } catch (error) {
        console.error("Error fetching activity stats:", error);
        return [];
    }
}
