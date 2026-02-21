import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IOrganizationMember extends Document {
    organizationId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    role: "admin" | "analyst" | "viewer";
    permissions: {
        canEdit: boolean;
        canDelete: boolean;
        canInvite: boolean;
        canViewReports: boolean;
        canGenerateReports: boolean;
    };
    invitedBy: mongoose.Types.ObjectId;
    invitedAt: Date;
    joinedAt?: Date;
    status: "invited" | "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationMemberSchema = new Schema<IOrganizationMember>(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ["admin", "analyst", "viewer"],
            required: true,
            default: "viewer",
        },
        permissions: {
            canEdit: {
                type: Boolean,
                default: false,
            },
            canDelete: {
                type: Boolean,
                default: false,
            },
            canInvite: {
                type: Boolean,
                default: false,
            },
            canViewReports: {
                type: Boolean,
                default: true,
            },
            canGenerateReports: {
                type: Boolean,
                default: false,
            },
        },
        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        invitedAt: {
            type: Date,
            default: Date.now,
        },
        joinedAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["invited", "active", "inactive"],
            default: "invited",
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure unique user per organization
OrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

// Auto-set permissions based on role
OrganizationMemberSchema.pre("save", function (next) {
    if (this.isModified("role")) {
        switch (this.role) {
            case "admin":
                this.permissions = {
                    canEdit: true,
                    canDelete: true,
                    canInvite: true,
                    canViewReports: true,
                    canGenerateReports: true,
                };
                break;
            case "analyst":
                this.permissions = {
                    canEdit: true,
                    canDelete: false,
                    canInvite: false,
                    canViewReports: true,
                    canGenerateReports: true,
                };
                break;
            case "viewer":
                this.permissions = {
                    canEdit: false,
                    canDelete: false,
                    canInvite: false,
                    canViewReports: true,
                    canGenerateReports: false,
                };
                break;
        }
    }
    next();
});

const OrganizationMember =
    models.OrganizationMember || model<IOrganizationMember>("OrganizationMember", OrganizationMemberSchema);

export default OrganizationMember;
