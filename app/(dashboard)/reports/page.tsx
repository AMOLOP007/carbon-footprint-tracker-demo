"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2, Eye, X, Brain, TrendingUp, PieChart as PieChartIcon, BarChart3, ArrowRight, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { generateReportPDF } from "@/lib/utils/pdf-generator";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import Link from "next/link";

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [reports, setReports] = useState<any[]>([]);
    const [viewingReport, setViewingReport] = useState<any | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await fetch("/api/reports");
            const data = await res.json();
            if (data.success) {
                // Ensure sorted by date descending
                const sorted = data.reports.sort((a: any, b: any) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setReports(sorted);
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch("/api/reports", { method: "POST" });
            const data = await res.json();

            if (data.success) {
                toast.success("Report generated successfully!");
                fetchReports();
            } else {
                toast.error("Failed to generate report.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = (report: any) => {
        try {
            const reportData = {
                title: report.title,
                summary: report.summary,
                dataSnapshot: report.dataSnapshot,
            };
            generateReportPDF(reportData);
            toast.success("Download started.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF.");
        }
    };

    const handleView = (report: any) => {
        setViewingReport(report);
    };

    const latestReport = reports.length > 0 ? reports[0] : null;

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

    const getChartData = (report: any) => {
        if (!report?.dataSnapshot?.byType) return [];
        return Object.entries(report.dataSnapshot.byType).map(([name, value]: any) => ({
            name: name.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            value: value
        })).filter(d => d.value > 0);
    };

    const getTrendData = (report: any) => {
        if (!report?.dataSnapshot?.recentCalcs) return [];
        return report.dataSnapshot.recentCalcs.slice(0, 5).reverse().map((c: any, i: number) => ({
            name: `Calc ${i + 1}`,
            emissions: c.emissions,
            type: c.type
        }));
    };

    return (
        <div className="container mx-auto max-w-7xl space-y-8 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold font-heading mb-2">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Comprehensive insights and automated ESG reporting.</p>
                </div>
                <Button onClick={handleGenerate} disabled={generating} size="lg" className="shadow-lg hover:shadow-primary/20">
                    {generating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                    Generate New Report
                </Button>
            </motion.div>

            {/* LATEST REPORT SPLIT VIEW */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : latestReport ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {/* LEFT: Actual Report Document View */}
                    <Card className="border-t-4 border-t-primary shadow-2xl overflow-hidden relative flex flex-col">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-widest border border-primary/20">
                                Official Document
                            </span>
                        </div>
                        <CardHeader className="bg-muted/5 pb-8 border-b">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">{latestReport.title}</CardTitle>
                                    <CardDescription>
                                        ID: {latestReport._id.slice(-8).toUpperCase()} • {new Date(latestReport.createdAt).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6 font-serif flex-1">
                            <div>
                                <h4 className="font-bold text-sm uppercase text-muted-foreground mb-2 tracking-wider">Executive Summary</h4>
                                <p className="leading-relaxed text-justify text-sm md:text-base">
                                    {latestReport.summary}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4 border-y">
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase mb-1">Total Carbon Footprint</div>
                                    <div className="text-3xl font-bold text-primary">
                                        {latestReport.dataSnapshot?.totalEmissions?.toFixed(2) || "0.00"} <span className="text-base font-normal text-muted-foreground">tCO2e</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase mb-1">Reporting Period</div>
                                    <div className="text-lg font-medium">
                                        Current Session
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-sm uppercase text-muted-foreground mb-2 tracking-wider">Detailed Findings</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm bg-muted/10 p-4 rounded-lg">
                                    <li>Primary emission source identified as <strong>{getChartData(latestReport).sort((a: any, b: any) => b.value - a.value)[0]?.name || 'N/A'}</strong>.</li>
                                    <li>Scope 1 emissions calculated at {((latestReport.dataSnapshot?.byType?.vehicle || 0) + (latestReport.dataSnapshot?.byType?.stationary || 0)).toFixed(2)} tCO2e.</li>
                                    <li>Scope 2 emissions calculated at {(latestReport.dataSnapshot?.byType?.electricity || 0).toFixed(2)} tCO2e.</li>
                                </ul>
                            </div>

                            <div className="flex gap-3 pt-4 mt-auto">
                                <Button onClick={() => handleDownload(latestReport)} className="flex-1" variant="outline">
                                    <Download className="mr-2 h-4 w-4" /> Download Signed PDF
                                </Button>
                                <Button onClick={() => handleView(latestReport)} className="flex-1">
                                    <Eye className="mr-2 h-4 w-4" /> Full Preview
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* RIGHT: Live Visualizations & AI Link */}
                    <div className="flex flex-col gap-6 h-full">
                        {/* 1. Pie Chart */}
                        <Card className="flex-1 bg-black/40 border-white/10 backdrop-blur-sm min-h-[300px]">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                    <PieChartIcon className="h-4 w-4" /> Live Emission Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[250px]">
                                {getChartData(latestReport).length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={getChartData(latestReport)}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {getChartData(latestReport).map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend verticalAlign="middle" layout="vertical" align="right" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 2. Bar Chart (Recent Activity) */}
                        <Card className="flex-1 bg-black/40 border-white/10 backdrop-blur-sm min-h-[300px]">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                    <BarChart3 className="h-4 w-4" /> Recent Activity Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[200px]">
                                {getTrendData(latestReport).length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={getTrendData(latestReport)}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                            <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} />
                                            <YAxis stroke="#666" fontSize={10} tickLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="emissions" fill="#10B981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground">No recent activity</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 3. AI Insights Call to Action */}
                        <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none shadow-xl mt-auto">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                                        <Brain className="h-5 w-5" /> AI Strategic Insights
                                    </h3>
                                    <p className="text-purple-100 text-sm max-w-[300px]">
                                        Process this report to generate unique, high-impact recommendations for your organization.
                                    </p>
                                </div>
                                <Button asChild size="lg" variant="secondary" className="shadow-lg hover:shadow-xl transition-all">
                                    <Link href="/insights?refresh=true">
                                        Process & View Analysis <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            ) : (
                <div className="text-center py-24 border-2 border-dashed border-primary/20 rounded-xl bg-muted/5">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Ready to Generate Insights</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        Your dashboard is set up. Use the Carbon Calculator or generate a new report to see your emissions data and AI-powered recommendations here.
                    </p>
                    <Button onClick={() => window.location.href = '/calculator'} size="lg" className="shadow-lg">
                        Go to Calculator <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div >
            )
            }

            {/* REPORT HISTORY GRID */}
            <div className="pt-10 border-t">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" /> Report History
                </h2>

                {reports.length > 1 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {reports.slice(1).map((report, i) => (
                            <motion.div
                                key={report._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="h-full flex flex-col hover:border-primary/50 transition-colors group bg-card/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex justify-between items-start leading-tight">
                                            <span className="line-clamp-2">{report.title}</span>
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <div className="text-2xl font-bold text-primary">
                                                {report.dataSnapshot?.totalEmissions?.toFixed(2) || "0.00"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">tCO2e Total</div>
                                        </div>
                                        <div className="mt-auto flex gap-2">
                                            <Button variant="secondary" size="sm" className="flex-1 h-8 text-xs" onClick={() => handleView(report)}>
                                                View
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleDownload(report)}>
                                                <Download className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : reports.length === 1 ? (
                    <div className="text-center py-10 text-muted-foreground bg-muted/5 rounded-lg">
                        No older reports to display.
                    </div>
                ) : null}
            </div>

            {/* View Report Modal (Unchanged) */}
            <AnimatePresence>
                {viewingReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setViewingReport(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-background border rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b shrink-0">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-2xl font-bold">{viewingReport.title}</h2>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-600 text-white hover:bg-green-700 gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                                            Industry Certified
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Generated on {new Date(viewingReport.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setViewingReport(null)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Summary</h3>
                                    <p className="text-muted-foreground">{viewingReport.summary}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-3xl font-bold text-primary">
                                                {viewingReport.dataSnapshot?.totalEmissions?.toFixed(2) || "0.00"} <span className="text-base text-muted-foreground">tCO2e</span>
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium">Report Period</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-lg font-semibold">
                                                {viewingReport.period && viewingReport.period.startDate && viewingReport.period.endDate
                                                    ? `${new Date(viewingReport.period.startDate).toLocaleDateString()} - ${new Date(viewingReport.period.endDate).toLocaleDateString()}`
                                                    : "Last 30 Days"}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {viewingReport.dataSnapshot?.byType && Object.keys(viewingReport.dataSnapshot.byType).length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Emissions by Category</h3>
                                        <div className="space-y-3">
                                            {Object.entries(viewingReport.dataSnapshot.byType).map(([type, value]: [string, any]) => (
                                                <div key={type} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                    <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                                                    <span className="text-primary font-bold">{value.toFixed(2)} tCO2e</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {viewingReport.dataSnapshot?.recentCalcs && viewingReport.dataSnapshot.recentCalcs.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Recent Calculations</h3>
                                        <div className="space-y-2">
                                            {viewingReport.dataSnapshot.recentCalcs.slice(0, 5).map((calc: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between text-sm p-2 hover:bg-muted/20 rounded">
                                                    <span className="capitalize">{calc.type?.replace('_', ' ')}</span>
                                                    <span className="text-muted-foreground">{calc.emissions?.toFixed(3)} tCO2e</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {viewingReport.aiInsightsSnapshot && (
                                    <div className="mt-6 pt-6 border-t">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <span className="bg-primary/20 p-1 rounded"><Brain className="h-4 w-4 text-primary" /></span>
                                            AI Insights Snapshot
                                        </h3>

                                        <div className="space-y-4">
                                            <Card className="bg-muted/30">
                                                <CardContent className="pt-4">
                                                    <p className="text-sm italic">"{viewingReport.aiInsightsSnapshot.summary}"</p>
                                                </CardContent>
                                            </Card>

                                            {viewingReport.aiInsightsSnapshot.recommendations && (
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {viewingReport.aiInsightsSnapshot.recommendations.map((rec: any, i: number) => (
                                                        <Card key={i} className="overflow-hidden">
                                                            <div className={`h-1 w-full ${rec.impact === 'high' ? 'bg-red-500' : rec.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                                            <CardHeader className="p-3 pb-0">
                                                                <CardTitle className="text-sm font-medium leading-tight">{rec.title}</CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="p-3">
                                                                <p className="text-xs text-muted-foreground line-clamp-2">{rec.description}</p>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            )}

                                            {viewingReport.aiInsightsSnapshot.innovativeIdea && (
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1 text-sm">Innovation Spotlight</h4>
                                                    <p className="text-sm font-medium">{viewingReport.aiInsightsSnapshot.innovativeIdea.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{viewingReport.aiInsightsSnapshot.innovativeIdea.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 p-6 border-t bg-muted/5 shrink-0">
                                <Button className="flex-1" onClick={() => handleDownload(viewingReport)}>
                                    <Download className="mr-2 h-4 w-4" /> Download PDF
                                </Button>
                                <Button variant="outline" onClick={() => setViewingReport(null)}>
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
