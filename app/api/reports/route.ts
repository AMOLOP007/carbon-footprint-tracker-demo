import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Report from "@/models/Report";
import Calculation from "@/models/Calculation";
import { verifyJWT } from "@/lib/auth"; // Need to ensure this exists or create it
import { cookies } from "next/headers";

async function getUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    // For demo/hardcoded user
    if (token.startsWith("mock-jwt-token") || token.startsWith("eyJhbGciOiJIUzI1NiJ9")) {
        return "507f1f77bcf86cd799439011";
    }

    try {
        const payload = await verifyJWT(token) as any;
        return payload?.id;
    } catch (e) {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        await connectToDB();
        const userId = await getUserId();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch recent calculations to summarize
        const recentCalcs = await Calculation.find({ userId }).sort({ createdAt: -1 }).limit(50);

        let totalEmissions = 0;
        let byType: any = {};

        recentCalcs.forEach(c => {
            totalEmissions += c.emissions;
            byType[c.type] = (byType[c.type] || 0) + c.emissions;
        });

        // Generate Summaries
        const summary = `Total Emissions: ${totalEmissions.toFixed(2)} tCO2e. Top source: ${Object.keys(byType).sort((a, b) => byType[b] - byType[a])[0] || 'None'}.`;

        const report = await Report.create({
            userId,
            title: `Carbon Report - ${new Date().toLocaleDateString()}`,
            summary,
            dataSnapshot: { totalEmissions, byType, recentCalcs },
            // In a real app, we'd generate a PDF buffer here and upload to S3, returning the URL
            // For this demo, we'll return the ID and render the PDF on the client or a specialized view page
        });

        return NextResponse.json({ success: true, reportId: report._id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await connectToDB();
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const reports = await Report.find({ userId }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, reports });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
