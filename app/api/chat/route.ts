import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import ChatSession from "@/models/ChatSession";
import { getUserId } from "@/lib/auth/getUserId";
import { rateLimiter } from "@/lib/security/rateLimiter";

export async function POST(req: Request) {
    let userId = "guest";

    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const rateLimit = await rateLimiter(ip, { windowMs: 60 * 1000, maxRequests: 30 });
    if (!rateLimit.success) {
        return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
    }

    try {
        const { message, context } = await req.json();

        // 1. Try to connect to DB and get User ID, but don't fail hard if it breaks
        try {
            await connectToDB();
            const id = await getUserId();
            if (id) userId = id;
        } catch (e) {
            console.warn("DB Connection failed, proceeding in stateless mode");
        }

        // 2. Generate AI Response (Enhanced Logic)
        let aiResponse = "I'm here to help you with your carbon footprint.";
        const lowerMsg = message.toLowerCase();

        // Context-aware checking
        if (context?.recentCalc && (lowerMsg.includes("analyze") || lowerMsg.includes("explain") || lowerMsg.includes("this"))) {
            const { type, value } = context.recentCalc;
            if (type === "shipping") {
                aiResponse = `I see you just calculated shipping emissions of ${value.toFixed(2)} tCO2e. Shipping often accounts for a large portion of Scope 3 emissions. To reduce this, consider consolidating shipments to increase weight per trip, or switching from Air (${(value * 0.9).toFixed(2)} savings possible) to Sea freight if time permits.`;
            } else if (type === "electricity") {
                aiResponse = `Your electricity usage resulted in ${value.toFixed(2)} tCO2e. Switching to 100% renewable sources like Solar or Wind could drop this to near zero (${(value * 0.05).toFixed(2)} tCO2e).`;
            } else {
                aiResponse = `For your recent ${type} calculation of ${value.toFixed(2)} tCO2e, I recommend auditing the efficiency of your current assets. Small operational changes often yield 10-15% reductions.`;
            }
        }
        // Knowledge Base Matches
        else if (lowerMsg.includes("shipping")) {
            aiResponse = "Shipping emissions depend heavily on mode and weight. Air freight is ~60x more carbon-intensive than Sea or Rail. For your logistics, try to maximize 'Load Factor' (filling containers completely) to reduce emissions per unit. Would you like a calculation for a specific route?";
        } else if (lowerMsg.includes("reduce") || lowerMsg.includes("lower") || lowerMsg.includes("strategy")) {
            aiResponse = "Here are three high-impact reduction strategies:\n1. **Switch to Renewables**: Moving to green tariffs for electricity is the fastest Scope 2 win.\n2. **Electrify Fleet**: Transitioning ICE vehicles to EVs reduces Scope 1 emissions by ~60-80% over lifetime.\n3. **Supplier Engagement**: For Scope 3, choose suppliers with verified Science-Based Targets (SBTi).";
        } else if (lowerMsg.includes("report") || lowerMsg.includes("audit")) {
            aiResponse = "You can generate a comprehensive PDF audit from the 'Reports' tab. This includes a breakdown of all your recent activity and an executive summary suitable for stakeholders.";
        } else if (lowerMsg.includes("offset") || lowerMsg.includes("credit")) {
            aiResponse = "Carbon offsets are a good transitional tool, but direct reduction should come first. If you must offset, look for Gold Standard or Verra verified projects that support community development alongside carbon sequestration.";
        } else if (lowerMsg.includes("scope 1") || lowerMsg.includes("scope 2") || lowerMsg.includes("scope 3")) {
            aiResponse = "**Scope 1**: Direct emissions from owned sources (e.g., your company cars, furnaces).\n**Scope 2**: Indirect emissions from purchased energy (e.g., electricity bills).\n**Scope 3**: All other indirect emissions in your value chain (e.g., business travel, purchased goods, shipping).\n\nAetherra helps you track all three.";
        }
        // Conversational / Personality
        else if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey") || lowerMsg.includes("greetings")) {
            aiResponse = "Hello! I'm Aetherra, your sustainability assistant. I can help interpret your data, suggest reduction strategies, or explain emission factors. What are we working on?";
        } else if (lowerMsg.includes("how are you")) {
            aiResponse = "I'm operating at peak efficiency and ready to help you decarbonize! How is your sustainability journey going today?";
        } else if (lowerMsg.includes("who are you") || lowerMsg.includes("what are you")) {
            aiResponse = "I am Aetherra, an intelligent sustainability assistant designed to help organizations measure, track, and reduce their carbon footprint. I can help you with calculations, reporting, and reduction strategies.";
        } else if (lowerMsg.includes("help") || lowerMsg.includes("what can you do")) {
            aiResponse = "I can assist you with several things:\n- **Calculate Emissions**: Guide you through Shipping, Electricity, or Fleet calculations.\n- **Analyze Results**: Explain what your emission numbers mean in context.\n- **Suggest Improvements**: Provide tailored strategies to reduce your footprint.\n- **Generate Reports**: Help you create summaries for your stakeholders.";
        } else if (lowerMsg.includes("thank") || lowerMsg.includes("thanks")) {
            aiResponse = "You're very welcome! Let me know if you need anything else to help reach your net-zero goals.";
        } else if (lowerMsg.includes("joke")) {
            aiResponse = "Why did the solar panel go to school? To get a little brighter! ☀️ (But seriously, renewable energy is a smart choice.)";
        } else {
            // Improved Fallback v2
            aiResponse = "I'm listening. While I'm specialized in carbon emissions and sustainability strategies, I'm here to help navigate the platform too. Could you ask me about *Scope 3 emissions*, *shipping logistics*, or *generating a report*?";
        }

        // 3. Try to save to DB, but ignore if it fails (Stateless fallback)
        if (userId !== "guest") {
            try {
                let session = await ChatSession.findOne({ userId });
                if (!session) {
                    session = await ChatSession.create({ userId, messages: [] });
                }
                session.messages.push({ role: "user", content: message });
                session.messages.push({ role: "assistant", content: aiResponse });
                await session.save();
            } catch (dbError) {
                console.warn("Failed to save chat history:", dbError);
                // Swallow error, don't fail the request
            }
        }

        return NextResponse.json({ success: true, message: aiResponse });
    } catch (error: any) {
        console.error("Critical Chat API Error:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        const rateLimit = await rateLimiter(ip, { windowMs: 60 * 1000, maxRequests: 60 });
        if (!rateLimit.success) {
            return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
        }

        await connectToDB();
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const session = await ChatSession.findOne({ userId });
        return NextResponse.json({ success: true, messages: session ? session.messages : [] });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
