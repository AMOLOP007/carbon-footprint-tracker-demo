"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // Need to create this if missing, actually Radix primitive or simple div
import {
  LayoutDashboard, Leaf, TrendingUp, Zap, Wind,
  ArrowUpRight, ArrowDownRight, Target, Activity,
  ChevronRight, Calendar, Sparkles, File, Calculator, Settings, PieChart
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const data = [
  { name: "Mon", emissions: 400, reduction: 240 },
  { name: "Tue", emissions: 300, reduction: 139 },
  { name: "Wed", emissions: 200, reduction: 980 },
  { name: "Thu", emissions: 278, reduction: 390 },
  { name: "Fri", emissions: 189, reduction: 480 },
  { name: "Sat", emissions: 239, reduction: 380 },
  { name: "Sun", emissions: 349, reduction: 430 },
];

const recentActivity = [
  { id: 1, user: "Sarah J.", action: "Updated Electricity usage for Building A", time: "2 hours ago", icon: Zap, color: "bg-amber-500/20 text-amber-500" },
  { id: 2, user: "Mike T.", action: "Generated Q3 Sustainability Report", time: "5 hours ago", icon: File, color: "bg-blue-500/20 text-blue-500" }, // File icon missing? Use Calendar or LayoutDashboard
  { id: 3, user: "Admin", action: "Integrated new AI model for logistics", time: "1 day ago", icon: Sparkles, color: "bg-purple-500/20 text-purple-500" },
  { id: 4, user: "System", action: "Optimized server cooling schedule", time: "1 day ago", icon: Wind, color: "bg-cyan-500/20 text-cyan-500" },
];

const goals = [
  { name: "Reduce Energy Consumption", target: "15%", current: 85, color: "bg-amber-500" },
  { name: "Carbon Neutral Logistics", target: "40%", current: 62, color: "bg-emerald-500" },
  { name: "Waste Recycling Rate", target: "90%", current: 45, color: "bg-blue-500" },
];

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
  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 container mx-auto max-w-7xl min-h-screen pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold font-heading track-tight text-white mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Welcome back, Admin. Your sustainability intelligence is ready.
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

      {/* Quick Actions Grid (Mobile focus but good for desktop too) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          { label: "Calculator", href: "/calculator", icon: Calculator, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Settings", href: "/settings", icon: Settings, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" },
          { label: "View Reports", href: "/reports", icon: PieChart, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        ].map((action, i) => ( // Calculator, Settings imports needed
          // Using placeholder icons if imports missing, fixing imports below
          null
        ))}
      </div>

      {/* Re-implementing Quick Actions properly with imports */}

      {/* KPI Section */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { title: "Total Carbon Emissions", value: "1,204 tCO2e", change: "-12.5%", trend: "down", icon: Wind, color: "text-rose-500", bg: "bg-rose-500/10" },
          { title: "Energy Usage", value: "45.2 MWh", change: "+2.4%", trend: "up", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "Offset Credits", value: "320 Credits", change: "+15%", trend: "up", icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Sustainability Score", value: "88/100", change: "+4pts", trend: "up", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
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
                <p className={`text-xs font-semibold flex items-center mt-2 ${kpi.trend === "up" && kpi.title !== "Total Carbon Emissions" ? "text-emerald-500" : kpi.trend === "down" && kpi.title === "Total Carbon Emissions" ? "text-emerald-500" : "text-rose-500"}`}>
                  {kpi.trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {kpi.change} <span className="text-muted-foreground font-normal ml-1">vs last month</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">

        {/* Chart Section - Spans 4 columns */}
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
                  <CardDescription>Real-time carbon footprint monitoring</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  View Full Report <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", color: "inherit" }}
                      itemStyle={{ color: "inherit" }}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <Area type="monotone" dataKey="emissions" stroke="#0f766e" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" activeDot={{ r: 8 }} />
                    <Area type="monotone" dataKey="reduction" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Goals & Progress Section - Spans 3 columns */}
        <motion.div
          className="col-span-3 lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Sustainability Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Goals
              </CardTitle>
              <CardDescription>Q3 Reduction Targets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {goals.map((goal, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{goal.name}</span>
                    <span className="text-muted-foreground">{goal.current}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${goal.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.current}%` }}
                      transition={{ duration: 1, delay: 0.8 + (i * 0.2) }}
                    />
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs mt-2">Manage Goals</Button>
            </CardContent>
          </Card>

          {/* Quick Tips / AI Highlight */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-accent" /> AI Suggestion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80">
                "Based on weather forecasts, reducing HVAC output by 2°C tomorrow could save <strong>8% daily energy</strong>."
              </p>
              <Button size="sm" variant="secondary" className="w-full mt-4 text-xs font-semibold">
                Apply Optimization
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className={`p-2 rounded-full ${activity.color}`}>
                      {activity.id === 2 ? <Calendar className="h-4 w-4" /> : <activity.icon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights Expanded */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" /> Intelligence Feed
                </CardTitle>
                <Link href="/ai-assistant">
                  <Button variant="ghost" size="sm" className="text-xs">Ask AI</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Inefficiency Detected", desc: "Server Room B cooling is running 24/7 despite low load.", badge: "Critical", badgeColor: "bg-red-500/10 text-red-500" },
                { title: "Offset Opportunity", desc: "New solar project in region available for credit purchase.", badge: "New", badgeColor: "bg-emerald-500/10 text-emerald-500" },
                { title: "Water Usage Spike", desc: "Unusual consumption pattern overlapping with maintenance window.", badge: "Analysing", badgeColor: "bg-blue-500/10 text-blue-500" },
              ].map((item, i) => (
                <div key={i} className="group flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer">
                  <div>
                    <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
// End of component
