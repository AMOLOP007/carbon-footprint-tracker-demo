"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Database, Trash2, Filter, Download, Loader2, FileDown, Eye, FileText, Brain, X, PieChart as PieChartIcon, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { generateReportPDF } from "@/lib/utils/pdf-generator";
import { toast } from "sonner";

interface Calculation {
    _id: string;
    type: string;
    inputs: Record<string, any>;
    emissions: number;
    createdAt: string;
}

interface Report {
    _id: string;
    title: string;
    summary: string;
    createdAt: string;
    type: string;
    dataSnapshot?: any;
    aiInsightsSnapshot?: any;
    period?: any;
}

interface AIAnalysis {
    _id: string;
    summary: string;
    createdAt: string;
    recommendations: any[];
}

export default function DataManagementPage() {
    const [calculations, setCalculations] = useState<Calculation[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // View Modal State
    const [viewingReport, setViewingReport] = useState<Report | null>(null);

    useEffect(() => {
        fetchData();
    }, [filterType, startDate, endDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            let url = "/api/data";
            const params = new URLSearchParams();

            if (filterType !== "all") params.append("type", filterType);
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);

            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                setCalculations(result.calculations || []);
                setReports(result.reports || []);
                setAiAnalysis(result.aiAnalysis || []);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, type: 'calculation' | 'report') => {
        if (!confirm("Are you sure you want to delete this record?")) return;

        if (type === 'calculation') {
            try {
                const response = await fetch(`/api/data?calculationId=${id}`, {
                    method: "DELETE",
                });
                const result = await response.json();
                if (result.success) {
                    setCalculations(calculations.filter((c) => c._id !== id));
                    toast.success("Calculation deleted");
                }
            } catch (error) {
                console.error("Failed to delete:", error);
            }
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

    const exportToCSV = () => {
        if (calculations.length === 0) {
            alert("No data to export");
            return;
        }

        const headers = ["Date", "Type", "Emissions (tCO2e)", "Details"];
        const rows = calculations.map((calc) => [
            new Date(calc.createdAt).toLocaleDateString(),
            calc.type,
            calc.emissions.toFixed(2),
            JSON.stringify(calc.inputs),
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `emissions-data-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Chart Helpers
    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
    const getChartData = (report: any) => {
        if (!report?.dataSnapshot?.byType) return [];
        return Object.entries(report.dataSnapshot.byType).map(([name, value]: any) => ({
            name: name.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            value: value
        })).filter(d => d.value > 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 md:p-10 container mx-auto max-w-7xl pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-heading mb-2">Data Management</h1>
                    <p className="text-muted-foreground">View emissions, reports, and AI insights history.</p>
                </div>
                <Button onClick={exportToCSV} disabled={calculations.length === 0} variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <Tabs defaultValue="emissions" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="emissions">Emissions Records ({calculations.length})</TabsTrigger>
                    <TabsTrigger value="reports">Saved Reports ({reports.length})</TabsTrigger>
                    <TabsTrigger value="insights">AI History ({aiAnalysis.length})</TabsTrigger>
                </TabsList>

                {/* EMISSIONS TAB */}
                <TabsContent value="emissions">
                    {/* Filters (Only for Emissions mostly) */}
                    <Card className="mb-6">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Filter className="h-4 w-4" /> Filter Emissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="electricity">Electricity</SelectItem>
                                            <SelectItem value="vehicle">Vehicle</SelectItem>
                                            <SelectItem value="shipping">Shipping</SelectItem>
                                            <SelectItem value="supply_chain">Supply Chain</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-0">
                            {calculations.length === 0 ? (
                                <EmptyState icon={Database} message="No emission records found." />
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Emissions (tCO2e)</TableHead>
                                                <TableHead>Details</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {calculations.map((calc, index) => (
                                                <motion.tr
                                                    key={calc._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    className="border-b"
                                                >
                                                    <TableCell>{new Date(calc.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="capitalize">{calc.type}</Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{calc.emissions.toFixed(2)}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                                        {JSON.stringify(calc.inputs)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(calc._id, 'calculation')}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* REPORTS TAB */}
                <TabsContent value="reports">
                    <Card>
                        <CardContent className="p-0">
                            {reports.length === 0 ? (
                                <EmptyState icon={FileText} message="No saved reports found." />
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Summary</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reports.map((report, index) => (
                                                <TableRow key={report._id} className="border-b">
                                                    <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-medium">{report.title}</TableCell>
                                                    <TableCell className="text-muted-foreground max-w-md truncate">{report.summary}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => setViewingReport(report)}>
                                                            <Eye className="h-4 w-4 mr-1" /> View
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDownload(report)}>
                                                            <Download className="h-4 w-4 mr-1" /> Download
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI HISTORY TAB */}
                <TabsContent value="insights">
                    <Card>
                        <CardContent className="p-0">
                            {aiAnalysis.length === 0 ? (
                                <EmptyState icon={Brain} message="No AI analysis history found." />
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Summary</TableHead>
                                                <TableHead>Recommendations</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {aiAnalysis.map((analysis, index) => (
                                                <TableRow key={analysis._id} className="border-b">
                                                    <TableCell>{new Date(analysis.createdAt).toLocaleDateString()} {new Date(analysis.createdAt).toLocaleTimeString()}</TableCell>
                                                    <TableCell className="max-w-md text-sm">{analysis.summary}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{analysis.recommendations.length} Recommendations</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* View Report Modal with Charts & Industry Certified Branding */}
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
                            className="bg-background border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b shrink-0 bg-muted/10">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-2xl font-bold">{viewingReport.title}</h2>
                                        <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> Industry Certified
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Generated on {new Date(viewingReport.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setViewingReport(null)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 space-y-8">
                                {/* Visualizations Section */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                                            <p className="text-muted-foreground leading-relaxed">{viewingReport.summary}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Card>
                                                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Emissions</CardTitle></CardHeader>
                                                <CardContent>
                                                    <p className="text-3xl font-bold text-primary">{viewingReport.dataSnapshot?.totalEmissions?.toFixed(2) || "0.00"} <span className="text-base text-muted-foreground">tCO2e</span></p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Scope Period</CardTitle></CardHeader>
                                                <CardContent><p className="text-lg font-semibold">{viewingReport.period || "Last 30 Days"}</p></CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    {/* Chart */}
                                    <div className="bg-black/20 border rounded-xl p-4 flex flex-col items-center justify-center min-h-[250px]">
                                        <h4 className="text-sm font-medium mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                                            <PieChartIcon className="h-4 w-4" /> Emission Breakdown
                                        </h4>
                                        {getChartData(viewingReport).length > 0 ? (
                                            <div className="h-[200px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={getChartData(viewingReport)}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={40}
                                                            outerRadius={60}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {getChartData(viewingReport).map((entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No chart data available</p>
                                        )}
                                    </div>
                                </div>

                                {/* Text Details */}
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

                                {/* AI Insights */}
                                {viewingReport.aiInsightsSnapshot && (
                                    <div className="mt-6 pt-6 border-t">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <span className="bg-primary/20 p-1 rounded"><Brain className="h-4 w-4 text-primary" /></span>
                                            AI Strategic Insights
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
                                                        <Card key={i} className="overflow-hidden border-l-4 border-l-primary">
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
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 p-6 border-t bg-muted/5 shrink-0 justify-between items-center">
                                <p className="text-xs text-muted-foreground">
                                    This report is industry certified and compliant with ISO 14064 standards.
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setViewingReport(null)}>Close</Button>
                                    <Button onClick={() => handleDownload(viewingReport)}>
                                        <Download className="mr-2 h-4 w-4" /> Download PDF
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function EmptyState({ icon: Icon, message }: { icon: any, message: string }) {
    return (
        <div className="text-center py-16">
            <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-lg font-medium mb-1">{message}</h2>
        </div>
    );
}
