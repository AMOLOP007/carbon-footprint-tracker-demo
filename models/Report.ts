import mongoose, { Schema, model, models } from "mongoose";

const ReportSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    summary: { type: String }, // AI summary or simple text
    dataSnapshot: { type: Object }, // Snapshot of calculations at generation time
    pdfUrl: { type: String }, // Optional if storing in S3/Blob, or just regenerated on fly
    createdAt: { type: Date, default: Date.now, expires: '90d' }, // TTL Index: Auto-delete after 90 days
});

const Report = models.Report || model("Report", ReportSchema);

export default Report;
