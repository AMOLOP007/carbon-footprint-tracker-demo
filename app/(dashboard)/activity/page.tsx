"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity as ActivityIcon, Calculator, FileText, Target, MessageSquare, Settings, Database, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Activity {
    _id: string;
    action: string;
    category: string;
    metadata: Record<string, any>;
    createdAt: string;
}

const categoryIcons: Record<string, any> = {
    calculation: Calculator,
    report: FileText,
    goal: Target,
    ai_chat: MessageSquare,
    settings: Settings,
    data_management: Database,
};

const categoryColors: Record<string, string> = {
    calculation: "text-blue-500 bg-blue-500/10",
    report: "text-green-500 bg-green-500/10",
    goal: "text-purple-500 bg-purple-500/10",
    ai_chat: "text-pink-500 bg-pink-500/10",
    settings: "text-gray-500 bg-gray-500/10",
    data_management: "text-orange-500 bg-orange-500/10",
};

export default function ActivityPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        fetchActivities();
    }, [filter]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const url = filter === "all" ? "/api/activity" : `/api/activity?category=${filter}`;
            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                setActivities(result.activities);
            }
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / 60000);

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 md:p-10 container mx-auto max-w-4xl">
            <div>
                <h1 className="text-4xl font-bold font-heading mb-2">Activity Log</h1>
                <p className="text-muted-foreground">Track all your platform activities</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {["all", "calculation", "report", "goal", "ai_chat", "data_management"].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === cat
                                ? "bg-primary text-white"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                            }`}
                    >
                        {cat === "all" ? "All Activity" : cat.replace("_", " ").charAt(0).toUpperCase() + cat.slice(1).replace("_", " ")}
                    </button>
                ))}
            </div>

            {/* Activity Timeline */}
            <div className="space-y-4">
                {activities.length === 0 ? (
                    <Card>
                        <CardContent className="pt-10 pb-10 text-center">
                            <ActivityIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <h2 className="text-xl font-bold mb-2">No Activities Yet</h2>
                            <p className="text-muted-foreground">
                                Start using the platform to see your activity here
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    activities.map((activity, index) => {
                        const Icon = categoryIcons[activity.category] || ActivityIcon;
                        const colorClass = categoryColors[activity.category] || "text-gray-500 bg-gray-500/10";

                        return (
                            <motion.div
                                key={activity._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-full ${colorClass}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{activity.action}</p>
                                                {activity.metadata.emissions && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Emissions: {activity.metadata.emissions.toFixed(2)} tCO2e
                                                    </p>
                                                )}
                                                {activity.metadata.calculationType && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Type: {activity.metadata.calculationType}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {formatTime(activity.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
