import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IReport extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    type: "pdf" | "csv";
    fileUrl?: string;
    fileData?: string;
    period?: {
        startDate: Date;
        endDate: Date;
    };
    summary?: string;
    metrics?: {
        totalEmissions: number;
        categories: {
            category: string;
            emissions: number;
        }[];
        trend?: string;
    };
    dataSnapshot?: {
        totalEmissions: number;
        byType: Record<string, number>;
        recentCalcs: any[];
    };
    aiInsightsSnapshot?: {
        summary: string;
        recommendations: any[];
        riskFlags: any[];
        innovativeIdea: any;
    };
    formattedReport?: {
        type: string;
        content: string;
    };
    expiresAt: Date;
    downloadCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
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
        type: {
            type: String,
            enum: ["pdf", "csv"],
            required: false, // Make optional if not always set by API
            default: "pdf"
        },
        fileUrl: {
            type: String,
            trim: true,
        },
        fileData: {
            type: String,
        },
        period: {
            startDate: {
                type: Date,
                required: false,
            },
            endDate: {
                type: Date,
                required: false,
            },
        },
        summary: {
            type: String,
        },
        metrics: {
            totalEmissions: {
                type: Number,
            },
            categories: [
                {
                    category: String,
                    emissions: Number,
                },
            ],
            trend: String,
        },
        dataSnapshot: {
            totalEmissions: Number,
            byType: Schema.Types.Mixed,
            recentCalcs: [Schema.Types.Mixed],
        },
        aiInsightsSnapshot: {
            summary: String,
            recommendations: [Schema.Types.Mixed],
            riskFlags: [Schema.Types.Mixed],
            innovativeIdea: Schema.Types.Mixed,
        },
        formattedReport: {
            type: String, // e.g. "html", "markdown"
            content: String,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
        downloadCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Automatically set expiration to 90 days from creation
ReportSchema.pre("save", function (next) {
    const report = this as unknown as IReport;
    if (report.isNew && !report.expiresAt) {
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
        report.expiresAt = ninetyDaysFromNow;
    }
    next();
});

// Index for auto-deletion
ReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Report = models.Report || model<IReport>("Report", ReportSchema);

export default Report;
