import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IInsight extends Document {
    userId: mongoose.Types.ObjectId;
    type: string;
    category: string;
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    priority: "low" | "medium" | "high";
    actionable: boolean;
    relatedData?: any;
    dismissed: boolean;
    dismissedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const InsightSchema = new Schema<IInsight>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String, // analysis, trend, recommendation, info
            required: true,
        },
        category: {
            type: String, // emissions, optimization, data_quality
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        impact: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "low",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        actionable: {
            type: Boolean,
            default: false,
        },
        relatedData: {
            type: Schema.Types.Mixed,
        },
        dismissed: {
            type: Boolean,
            default: false,
        },
        dismissedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
InsightSchema.index({ userId: 1, dismissed: 1, priority: -1 });
InsightSchema.index({ userId: 1, category: 1 });

const Insight = models.Insight || model<IInsight>("Insight", InsightSchema);

export default Insight;
