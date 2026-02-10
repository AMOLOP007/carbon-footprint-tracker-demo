"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { generateReportPDF } from "@/lib/pdf-generator";

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await fetch("/api/reports");
            const data = await res.json();
            if (data.success) {
                setReports(data.reports);
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
                fetchReports(); // Refresh list
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
            // Reconstruct data structure expected by generator
            const reportData = {
                title: report.title,
                summary: report.summary,
                dataSnapshot: report.dataSnapshot,
                // user data would come from context or auth in a real app
            };
            generateReportPDF(reportData);
            toast.success("Download started.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF.");
        }
    };

    return (
        <div className="container mx-auto max-w-5xl space-y-8 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold font-heading mb-2">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Generate comprehensive sustainability audits and track your progress.</p>
                </div>
                <Button onClick={handleGenerate} disabled={generating} size="lg" className="shadow-lg hover:shadow-primary/20">
                    {generating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                    Generate New Report
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : reports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report, i) => (
                            <motion.div
                                key={report._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="h-full flex flex-col hover:border-primary/50 transition-colors group">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex justify-between items-start">
                                            <span className="line-clamp-1">{report.title}</span>
                                            <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </CardTitle>
                                        <CardDescription>
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {report.summary}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm font-medium">
                                            <span>
                                                Total: <span className="text-primary">{report.dataSnapshot?.totalEmissions?.toFixed(2) || "0.00"} tCO2e</span>
                                            </span>
                                            <Button variant="ghost" size="sm" className="gap-2" onClick={() => handleDownload(report)}>
                                                <Download className="h-4 w-4" /> Download PDF
                                            </Button>
                                        </div>
                                    </CardContent>

                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">No reports generated yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                            Generate your first sustainability report to see a detailed breakdown of your emissions.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
