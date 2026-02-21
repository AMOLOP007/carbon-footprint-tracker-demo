"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Info, RefreshCw, Loader2, Zap, Brain, Sparkles, Activity, Download } from "lucide-react";
import { generateReportPDF } from "@/lib/utils/pdf-generator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";

interface AIAnalysis {
    _id: string;
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
    createdAt: string;
}

export default function InsightsClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [dataPoints, setDataPoints] = useState(0);

    useEffect(() => {
        setDataPoints(Math.floor(Math.random() * 500) + 1000);
    }, []);

    // Cool Loading State
    const [loadingMessage, setLoadingMessage] = useState("Initializing AI Core...");
    const loadingMessages = [
        "Connecting to Neural Network...",
        "Ingesting Carbon Data...",
        "Identifying Optimization Vectors...",
        "Synthesizing Unique Strategies...",
        "Finalizing Strategic Report..."
    ];

    useEffect(() => {
        // Cycle loading messages
        if (loading || generating) {
            let i = 0;
            const interval = setInterval(() => {
                i = (i + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[i]);
            }, 800);
            return () => clearInterval(interval);
        }
    }, [loading, generating]);

    useEffect(() => {
        const checkAndGenerate = async () => {
            const shouldRefresh = searchParams.get('refresh') === 'true';

            try {
                // First check if we have one
                setLoading(true);
                const res = await fetch("/api/insights/generate");
                const data = await res.json();

                if (data.success && data.analysis) {
                    // If we have data, but refresh is requested, or if data is old?
                    // User asked for "redirect ... should then automatically generate"
                    if (shouldRefresh) {
                        // Trigger generation
                        await generateNewAnalysis(false); // false = don't set loading state again inside
                    } else {
                        setAnalysis(data.analysis);
                        setLoading(false);
                    }
                } else {
                    // No analysis exists, auto-generate regardless of refresh param
                    await generateNewAnalysis(false);
                }
            } catch (e) {
                console.error(e);
                setLoading(false);
            } finally {
                // If we were refreshing, remove the param so it doesn't loop
                if (shouldRefresh) {
                    router.replace('/insights');
                }
            }
        };

        checkAndGenerate();
    }, []); // Run once on mount

    const generateNewAnalysis = async (manageLoadingState = true) => {
        try {
            if (manageLoadingState) setGenerating(true);
            else setLoading(true); // Ensure main loader is visible if called from effective init

            // Artificial delay to ensure "Cool Loading Screen" is seen for at least 2.5s if API is too fast
            const minWait = new Promise(resolve => setTimeout(resolve, 2500));
            const apiCall = fetch("/api/insights/generate", { method: "POST" });

            const [_, response] = await Promise.all([minWait, apiCall]);
            const data = await response.json();

            if (data.success) {
                setAnalysis(data.analysis);
                toast.success("New Strategic Analysis Generated");
            } else {
                toast.error(data.error || "Failed to generate analysis.");
                // Retain old analysis if available
            }
        } catch (error) {
            console.error("Failed to generate analysis:", error);
            toast.error("An error occurred.");
        } finally {
            setGenerating(false);
            setLoading(false);
        }
    };

    const handleDownloadReport = () => {
        if (!analysis) return;

        const reportData = {
            title: "Strategic AI Analysis",
            summary: analysis.summary,
            dataSnapshot: {
                totalEmissions: 0, // In a real app we'd fetch this or pass it down
                byType: {},
                recentCalcs: []
            },
            aiAnalysis: analysis
        };

        generateReportPDF(reportData);
        toast.success("Downloading report...");
    };

    if (loading || generating) {
        return (
            <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center">
                <div className="relative">
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 rounded-full border-t-4 border-l-4 border-primary/50 shadow-[0_0_50px_rgba(16,185,129,0.5)]"
                    />
                    <motion.div
                        animate={{ rotate: -180 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 rounded-full border-b-4 border-r-4 border-purple-500/50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="h-12 w-12 text-foreground animate-pulse" />
                    </div>
                </div>

                <motion.h2
                    key={loadingMessage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-8 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600"
                >
                    {loadingMessage}
                </motion.h2>
                <p className="text-muted-foreground mt-2 text-sm">Reviewing {dataPoints || 1250} data points...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-6 md:p-10 container mx-auto max-w-7xl pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                        <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-heading">AI Consultant</h1>
                        <p className="text-muted-foreground">Strategic analysis based on your live emissions data.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleDownloadReport}
                        disabled={generating || !analysis}
                        variant="outline"
                        size="lg"
                        className="shadow-sm"
                    >
                        <Download className="mr-2 h-4 w-4" /> Download Report
                    </Button>
                    <Button
                        onClick={() => generateNewAnalysis(true)}
                        disabled={generating}
                        size="lg"
                        className="shadow-lg hover:shadow-primary/25 transition-all"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" /> Regenerate Analysis
                    </Button>
                </div>
            </div>

            {!analysis ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
                    <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No Analysis Generated Yet</h3>
                    <Button onClick={() => generateNewAnalysis(true)} className="mt-4">
                        Generate First Analysis
                    </Button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Executive Summary */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/10 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Activity className="h-5 w-5 text-blue-500" />
                                    Executive Summary
                                </CardTitle>
                                <CardDescription>
                                    Generated on {new Date(analysis.createdAt).toLocaleDateString()} at {new Date(analysis.createdAt).toLocaleTimeString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="leading-relaxed text-lg text-muted-foreground">
                                    {analysis.summary}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Innovative Highlight */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-purple-500/30 overflow-hidden relative shadow-md">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <Zap className="w-32 h-32 rotate-12" />
                            </div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-500">
                                    <Sparkles className="h-6 w-6" />
                                    Unique Recommendation
                                </CardTitle>
                                <CardDescription className="text-purple-400">Custom tailored strategy for your specific emission profile</CardDescription>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <h3 className="text-2xl font-bold mb-3">{analysis.innovativeIdea.title}</h3>
                                <p className="mb-6 text-muted-foreground leading-relaxed max-w-3xl">{analysis.innovativeIdea.description}</p>
                                <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full text-sm font-medium border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                                    <TrendingUp className="h-4 w-4" />
                                    Predicted Impact: {analysis.innovativeIdea.potentialImpact}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Recommendations */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                Action Plan
                            </h2>
                            {analysis.recommendations.map((rec, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                >
                                    <Card className="hover:border-primary/50 transition-all hover:shadow-md bg-card/50">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="capitalize">{rec.category}</Badge>
                                                <Badge className={
                                                    rec.impact === 'high' ? 'bg-green-600 hover:bg-green-700' :
                                                        rec.impact === 'medium' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                                                }>
                                                    {rec.impact} Impact
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Risk Flags */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                                Risk Analysis
                            </h2>
                            {analysis.riskFlags.length === 0 ? (
                                <Card className="bg-green-500/5 border-green-500/20">
                                    <CardContent className="flex items-center gap-4 py-8">
                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                        <div>
                                            <h3 className="font-bold text-green-500">No Critical Risks Detected</h3>
                                            <p className="text-sm text-muted-foreground">Your sustainability metrics are stable.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                analysis.riskFlags.map((risk, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                    >
                                        <Card className={`border-l-4 ${risk.severity === 'critical' ? 'border-l-red-500 bg-red-500/5' :
                                            risk.severity === 'warning' ? 'border-l-amber-500 bg-amber-500/5' :
                                                'border-l-blue-500 bg-blue-500/5'
                                            }`}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-base font-semibold">{risk.title}</CardTitle>
                                                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                                                        {risk.severity}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">{risk.description}</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
