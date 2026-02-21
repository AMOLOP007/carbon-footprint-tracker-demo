import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IActivity extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    category: "calculation" | "report" | "goal" | "ai_chat" | "auth" | "settings" | "data_management";
    metadata: {
        calculationType?: string;
        emissions?: number;
        reportId?: string;
        goalId?: string;
        [key: string]: any;
    };
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        action: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: ["calculation", "report", "goal", "ai_chat", "auth", "settings", "data_management"],
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Indexes for efficient queries
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ category: 1, createdAt: -1 });

// TTL index - automatically delete activities older than 1 year
ActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const Activity = models.Activity || model<IActivity>("Activity", ActivitySchema);

export default Activity;
