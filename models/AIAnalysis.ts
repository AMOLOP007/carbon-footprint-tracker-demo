import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IAIAnalysis extends Document {
    userId: mongoose.Types.ObjectId;
    summary: string;
    recommendations: {
        title: string;
        description: string;
        impact: "high" | "medium" | "low";
        category: "energy" | "transport" | "waste" | "general" | "optimization";
    }[];
    riskFlags: {
        title: string;
        description: string;
        severity: "critical" | "warning" | "info";
    }[];
    innovativeIdea: {
        title: string;
        description: string;
        potentialImpact: string;
    };
    relatedReportId?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        summary: {
            type: String,
            required: true,
        },
        recommendations: [{
            title: String,
            description: String,
            impact: {
                type: String,
                enum: ["high", "medium", "low"],
            },
            category: {
                type: String,
                enum: ["energy", "transport", "waste", "general", "optimization"],
            }
        }],
        riskFlags: [{
            title: String,
            description: String,
            severity: {
                type: String,
                enum: ["critical", "warning", "info"],
            }
        }],
        innovativeIdea: {
            title: String,
            description: String,
            potentialImpact: String,
        },
        relatedReportId: {
            type: Schema.Types.ObjectId,
            ref: "Report",
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Only createdAt needed often
    }
);

// Index to easily find latest analysis for a user
AIAnalysisSchema.index({ userId: 1, createdAt: -1 });

const AIAnalysis = models.AIAnalysis || model<IAIAnalysis>("AIAnalysis", AIAnalysisSchema);

export default AIAnalysis;
