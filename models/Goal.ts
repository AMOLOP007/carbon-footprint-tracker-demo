import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IGoal extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    category: "energy" | "transport" | "waste" | "supply_chain" | "general";
    target: number; // Target reduction percentage or absolute value
    targetType: "percentage" | "absolute"; // Percentage reduction or absolute emissions
    current: number; // Current progress
    baseline?: number; // Baseline value for percentage calculations
    deadline: Date;
    status: "active" | "completed" | "overdue" | "cancelled";
    milestones?: {
        value: number;
        reached: boolean;
        reachedAt?: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            enum: ["energy", "transport", "waste", "supply_chain", "general"],
            required: true,
        },
        target: {
            type: Number,
            required: true,
            min: 0,
        },
        targetType: {
            type: String,
            enum: ["percentage", "absolute"],
            required: true,
            default: "percentage",
        },
        current: {
            type: Number,
            default: 0,
            min: 0,
        },
        baseline: {
            type: Number,
            min: 0,
        },
        deadline: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "completed", "overdue", "cancelled"],
            default: "active",
        },
        milestones: [
            {
                value: Number,
                reached: {
                    type: Boolean,
                    default: false,
                },
                reachedAt: Date,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ deadline: 1 });

const Goal = models.Goal || model<IGoal>("Goal", GoalSchema);

export default Goal;
