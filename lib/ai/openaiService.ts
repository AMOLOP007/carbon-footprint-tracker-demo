import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface AIAnalysisResult {
    summary: string;
    recommendations: {
        title: string;
        description: string;
        impact: "high" | "medium" | "low";
        category: "energy" | "transport" | "waste" | "general" | "optimization";
    }[];
    riskFlags: {
        title: string;
        description: string;
        severity: "critical" | "warning" | "info";
    }[];
    innovativeIdea: {
        title: string;
        description: string;
        potentialImpact: string;
    };
}

export async function generateSustainabilityAnalysis(
    emissionsData: any,
    recentReports: any[],
    goals: any[]
): Promise<AIAnalysisResult | null> {
    // 1. Check for Empty Data to prevent hallucinations
    if (!emissionsData || emissionsData.total <= 0) {
        return {
            summary: "No emissions data detected. Please use the calculator to generate an initial footprint assessment.",
            recommendations: [
                { title: "Start Calculation", description: "Input your energy or vehicle usage in the Calculator tab.", impact: "high", category: "general" }
            ],
            riskFlags: [],
            innovativeIdea: { title: "Awaiting Data", description: "AI analysis requires baseline data to generate innovation strategies.", potentialImpact: "N/A" }
        };
    }

    if (!process.env.OPENAI_API_KEY) {
        // console.warn("OPENAI_API_KEY is not set. Using advanced fallback protocol.");
        return getFallbackAnalysis(emissionsData);
    }

    try {
        const prompt = `
            Act as a Senior Sustainability Consultant for a corporation.
            Analyze the following data and provide a strategic analysis.

            DATA CONTEXT:
            - Total Emissions: ${emissionsData.total} tCO2e
            - Breakdown by Category: ${JSON.stringify(emissionsData.byCategory)}
            - Recent Trends: ${JSON.stringify(emissionsData.trends)}
            - Active Goals: ${JSON.stringify(goals)}

            REQUIREMENTS:
            1. Executive Summary: concise, professional, highlighting key status.
            2. Recommendations: 3 specific, actionable steps.
            3. Risk Flags: Identify any critical or warning signals (e.g. rising trends, missed goals).
            4. Innovative Idea: One creative, out-of-the-box, UNIQUE strategy for reduction. Do not give generic advice like "switch to LED" or "remote work". Provide a bold, specific, high-tech, or structural change tailored to the emissions profile (e.g., "Implement Algae Bioreactor Facade", "Kinetic Energy Harvesting Fleet", "Blockchain Supply Chain Tracking").

            OUTPUT FORMAT:
            Strict JSON object with the following structure:
            {
                "summary": "...",
                "recommendations": [
                    { "title": "...", "description": "...", "impact": "high|medium|low", "category": "energy|transport|waste|general|optimization" }
                ],
                "riskFlags": [
                    { "title": "...", "description": "...", "severity": "critical|warning|info" }
                ],
                "innovativeIdea": {
                    "title": "...",
                    "description": "...",
                    "potentialImpact": "..."
                }
            }
        `;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a specialized AI for Carbon Management and Sustainability Analysis. Output strictly in JSON." },
                { role: "user", content: prompt }
            ],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        // console.log("OpenAI Response Status:", completion.choices[0].finish_reason);
        const content = completion.choices[0].message.content;

        if (!content) {
            console.error("OpenAI returned empty content");
            return getFallbackAnalysis(emissionsData);
        }

        try {
            const result = JSON.parse(content);
            return result as AIAnalysisResult;
        } catch (jsonError) {
            console.error("Failed to parse OpenAI JSON response:", content);
            return getFallbackAnalysis(emissionsData);
        }

    } catch (error) {
        console.error("Error generating AI analysis:", error);
        return getFallbackAnalysis(emissionsData);
    }
}

import { FALLBACK_POOLS } from "./fallbackData";

function getFallbackAnalysis(data: any): AIAnalysisResult {
    // Determine dominant category
    const categories = data.byCategory || {};
    let dominant = "general";
    let maxVal = 0;

    for (const [key, val] of Object.entries(categories)) {
        if ((val as number) > maxVal) {
            maxVal = val as number;
            dominant = key;
        }
    }

    // Map calculator types to fallback keys
    let poolKey: keyof typeof FALLBACK_POOLS = 'supply'; // Default
    if (dominant === 'electricity') poolKey = 'electricity';
    if (dominant === 'shipping') poolKey = 'shipping';
    if (dominant === 'vehicle') poolKey = 'vehicle';

    let pool: any[] = [];

    // Handle Vehicle Sub-types (if data allows, otherwise random vehicle)
    if (poolKey === 'vehicle') {
        const vehiclePools = FALLBACK_POOLS['vehicle'];
        // Ideally we'd know input inputs.class, but for now we randomize across car/truck if generic
        const subTypes = Object.keys(vehiclePools);
        const randomSub = subTypes[Math.floor(Math.random() * subTypes.length)];
        pool = vehiclePools[randomSub as keyof typeof vehiclePools];
    } else {
        pool = FALLBACK_POOLS[poolKey] || FALLBACK_POOLS['supply'];
    }

    // Select random unique set
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
}
