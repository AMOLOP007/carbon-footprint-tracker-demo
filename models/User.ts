import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
    },
    password: {
        type: String,
        select: false // Never return password by default
    },
    provider: {
        type: String,
        enum: ["credentials", "google"],
        required: [true, "Provider is required"],
        default: "credentials"
    },
    providerId: {
        type: String
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Prevent model recompilation error in HMR
const User = models.User || model("User", UserSchema);

export default User;
