import mongoose, { Schema, model, models } from "mongoose";

const MessageSchema = new Schema({
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const ChatSessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messages: [MessageSchema],
    lastUpdated: { type: Date, default: Date.now },
});

const ChatSession = models.ChatSession || model("ChatSession", ChatSessionSchema);

export default ChatSession;
