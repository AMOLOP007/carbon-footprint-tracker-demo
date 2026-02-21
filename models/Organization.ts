import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IOrganization extends Document {
    name: string;
    description?: string;
    ownerId: mongoose.Types.ObjectId;
    industry?: string;
    size?: "small" | "medium" | "large" | "enterprise";
    settings: {
        defaultCurrency?: string;
        timezone?: string;
        emissionScope?: "organization" | "individual";
    };
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        industry: {
            type: String,
            trim: true,
        },
        size: {
            type: String,
            enum: ["small", "medium", "large", "enterprise"],
        },
        settings: {
            defaultCurrency: {
                type: String,
                default: "USD",
            },
            timezone: {
                type: String,
                default: "UTC",
            },
            emissionScope: {
                type: String,
                enum: ["organization", "individual"],
                default: "organization",
            },
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Organization = models.Organization || model<IOrganization>("Organization", OrganizationSchema);

export default Organization;
