import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for OAuth users
    image: { type: String }, // User avatar from OAuth
    provider: { type: String, default: "credentials" }, // credentials, google, apple, etc.
    company: { type: String },
    role: { type: String, default: "user" },
    createdAt: { type: Date, default: Date.now },
});

// Prevent model recompilation error in HMR
const User = models.User || model("User", UserSchema);

export default User;
