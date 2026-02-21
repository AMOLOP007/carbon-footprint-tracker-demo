"use client";

import { useEffect, useState, useMemo, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Calculator, Leaf, TrendingUp, Zap, Target, Sparkles, ChevronRight, Info, ArrowUpRight, ArrowDownRight, Shield, Lock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { useCountUp } from "@/lib/hooks/useCountUp";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from "recharts";

interface DashboardData {
  totalEmissions: number;
  monthlyEmissions: number;
  reductionPercentage: number;
  sustainabilityScore: number;
  categoryBreakdown: Record<string, number>;
  trendData: { date: string; emissions: number }[];
  goalsProgress: Array<{
    id: string;
    title: string;
    progress: number;
    target: number;
    current: number;
    deadline: string;
    status: string;
  }>;
  totalCalculations: number;
  hasData: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const result = await response.json();
      if (result.success && result.data) {
        setDashboardData(result.data);
      }
    } catch (err: any) {
      console.error("Dashboard data fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data with ALWAYS-VISIBLE fallback
  const hasData = dashboardData?.hasData || false;

  const categoryChartData = dashboardData?.categoryBreakdown && Object.keys(dashboardData.categoryBreakdown).length > 0
    ? Object.entries(dashboardData.categoryBreakdown).map(([category, value], index) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value,
      color: ["#f5990b", "#10b981", "#3b82f6", "#8b5cf6"][index % 4],
    }))
    : [
      { name: 'Electricity', value: 35.5, color: '#10b981' },
      { name: 'Vehicle', value: 28.3, color: '#3b82f6' },
      { name: 'Shipping', value: 22.7, color: '#f5990b' },
      { name: 'Supply Chain', value: 18.9, color: '#8b5cf6' },
    ];

  const trendData = dashboardData?.trendData && dashboardData.trendData.length > 0
    ? dashboardData.trendData
    : [
      { date: 'Mon', emissions: 12.4 },
      { date: 'Tue', emissions: 19.2 },
      { date: 'Wed', emissions: 15.7 },
      { date: 'Thu', emissions: 22.1 },
      { date: 'Fri', emissions: 17.8 },
      { date: 'Sat', emissions: 14.3 },
      { date: 'Sun', emissions: 20.5 },
    ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-md">
          <p className="text-red-500 mb-4">Failed to load dashboard</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 container mx-auto max-w-7xl min-h-screen pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />

      {/* Security Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-2 flex items-center gap-2 text-sm"
      >
        <Shield className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground">Your data is encrypted and secure</span>
        <Lock className="h-3 w-3 text-muted-foreground ml-auto" />
      </motion.div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold font-heading track-tight mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Welcome to Aetherra. Your sustainability intelligence platform.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/reports">
            <Button variant="outline" className="h-10 border-primary/20 hover:bg-primary/5">
              Download Report
            </Button>
          </Link>
          <Link href="/calculator">
            <Button className="h-10 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Leaf className="mr-2 h-4 w-4" /> New Entry
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Section */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            title: "Total Carbon Emissions",
            value: hasData ? `${dashboardData?.totalEmissions?.toFixed(1) || 0} tCO2e` : "0 tCO2e",
            change: hasData && dashboardData?.reductionPercentage ? `${dashboardData.reductionPercentage.toFixed(1)}%` : "—",
            trend: (dashboardData?.reductionPercentage || 0) > 0 ? "down" : "up",
            icon: Wind,
            color: "text-rose-500",
            bg: "bg-rose-500/10"
          },
          {
            title: "Monthly Emissions",
            value: hasData ? `${dashboardData?.monthlyEmissions?.toFixed(1) || 0} tCO2e` : "0 tCO2e",
            change: hasData && dashboardData?.reductionPercentage ? `${dashboardData.reductionPercentage.toFixed(1)}%` : "—",
            trend: (dashboardData?.reductionPercentage || 0) > 0 ? "down" : "up",
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
          },
          {
            title: "Calculations",
            value: hasData ? (dashboardData?.totalCalculations?.toString() || "0") : "0",
            change: "—",
            trend: "up",
            icon: Calculator,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
          },
          {
            title: "Sustainability Score",
            value: hasData ? `${dashboardData?.sustainabilityScore || 0}/100` : "—",
            change: "—",
            trend: "up",
            icon: TrendingUp,
            color: "text-primary",
            bg: "bg-primary/10"
          },
        ].map((kpi, i) => (
          <motion.div key={kpi.title} variants={item}>
            <Card className="hover:shadow-xl transition-all duration-300 border-l-4 overflow-hidden group relative" style={{ borderLeftColor: 'currentColor' }}>
              <div className={`absolute right-0 top-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500 ${kpi.color}`}>
                <kpi.icon size={64} />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${kpi.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold font-heading tracking-tight">{kpi.value}</div>
                {hasData && kpi.change !== "—" && (
                  <p className={`text-xs font-semibold flex items-center mt-2 ${kpi.trend === "down" && kpi.title.includes("Emissions") ? "text-emerald-500" : kpi.trend === "up" && !kpi.title.includes("Emissions") ? "text-emerald-500" : "text-rose-500"}`}>
                    {kpi.trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {kpi.change} <span className="text-muted-foreground font-normal ml-1">vs last month</span>
                  </p>
                )}
                {!hasData && (
                  <p className="text-xs text-muted-foreground mt-2">Add your first calculation</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>


      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
        {/* Chart Section */}
        <motion.div
          className="col-span-4 lg:col-span-5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Emission Trends</CardTitle>
                  <CardDescription>Your carbon footprint over time</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  View Full Report <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pl-0">
              {trendData.length > 0 ? (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", border: "none", borderRadius: "8px" }} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <Area type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  <p>Not enough data for trends yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Goals Section */}
        <motion.div
          className="col-span-3 lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Goals
              </CardTitle>
              <CardDescription>Your sustainability targets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {dashboardData?.goalsProgress && dashboardData.goalsProgress.length > 0 ? (
                dashboardData.goalsProgress.slice(0, 3).map((goal, i) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{goal.title}</span>
                      <span className="text-muted-foreground">{goal.progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 1, delay: 0.8 + (i * 0.2) }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <p>No goals set yet</p>
                </div>
              )}
              <Link href="/goals">
                <Button variant="ghost" className="w-full text-xs mt-2">Manage Goals</Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Suggestion */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-accent" /> AI Suggestion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80">
                {(dashboardData?.totalCalculations ?? 0) > 5
                  ? "Great progress! Consider setting reduction goals to track your sustainability journey."
                  : "Add more calculations to unlock personalized AI insights."}
              </p>
              <Link href={(dashboardData?.totalCalculations ?? 0) > 5 ? "/insights" : "/calculator"}>
                <Button size="sm" variant="secondary" className="w-full mt-4 text-xs font-semibold">
                  {(dashboardData?.totalCalculations ?? 0) > 5 ? "View Insights" : "Add More Data"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Emissions by Category Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Category</CardTitle>
            <CardDescription>Distribution of your carbon emissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {categoryChartData.map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-muted-foreground">{cat.name}: {cat.value.toFixed(1)} tCO2e</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>


      {/* About Aetherra Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>About Aetherra</CardTitle>
                <CardDescription>Your sustainability intelligence partner</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Aetherra empowers organizations to measure, analyze, and reduce their carbon footprint through
              intelligent data-driven insights. Track emissions across electricity, vehicles, shipping, and
              supply chains with precision.
            </p>
            <div className="flex gap-2">
              <Link href="/about">
                <Button variant="outline" size="sm">
                  <Info className="mr-2 h-4 w-4" />
                  Learn More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground space-y-4"
      >
        <div className="flex justify-center gap-6">
          <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/data" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/settings" className="hover:text-foreground transition-colors">Settings</Link>
        </div>
        <p>© 2026 Aetherra • Making sustainability accessible to everyone</p>
      </motion.footer>
    </div>
  );
}
