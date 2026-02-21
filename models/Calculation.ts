import mongoose, { Schema, model, models } from "mongoose";

const CalculationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        required: true,
        enum: ["electricity", "vehicle", "shipping", "supply", "supply_chain"], // Accept both supply and supply_chain
    },
    inputs: { type: Object, required: true }, // Dynamic based on type
    emissions: { type: Number, required: true }, // tCO2e
    createdAt: { type: Date, default: Date.now },
}, { strict: true });

// Index for quick retrieval by user and type
CalculationSchema.index({ userId: 1, type: 1 });

// Prevent Mongoose overwrite warning in dev
if (process.env.NODE_ENV === "development") {
    if (models.Calculation) {
        delete models.Calculation;
    }
}

const Calculation = models.Calculation || model("Calculation", CalculationSchema);

export default Calculation;
