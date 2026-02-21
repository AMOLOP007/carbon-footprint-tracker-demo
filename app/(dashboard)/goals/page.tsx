"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Target, Plus, Trash2, Edit2, Check, Loader2, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface Goal {
    _id: string;
    title: string;
    description?: string;
    category: string;
    target: number;
    targetType: string;
    current: number;
    baseline?: number;
    deadline: string;
    status: string;
}

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "general",
        target: "",
        targetType: "percentage",
        baseline: "",
        deadline: "",
    });

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/goals");
            const result = await response.json();

            if (result.success) {
                setGoals(result.goals);
            }
        } catch (error) {
            console.error("Failed to fetch goals:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    target: parseFloat(formData.target),
                    baseline: formData.baseline ? parseFloat(formData.baseline) : undefined,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setGoals([...goals, result.goal]);
                setShowCreateForm(false);
                setFormData({
                    title: "",
                    description: "",
                    category: "general",
                    target: "",
                    targetType: "percentage",
                    baseline: "",
                    deadline: "",
                });
            } else {
                alert(result.error || "Failed to create goal");
            }
        } catch (error) {
            console.error("Failed to create goal:", error);
            alert("Failed to create goal");
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!confirm("Are you sure you want to delete this goal?")) return;

        try {
            const response = await fetch(`/api/goals?goalId=${goalId}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (result.success) {
                setGoals(goals.filter(g => g._id !== goalId));
            } else {
                alert(result.error || "Failed to delete goal");
            }
        } catch (error) {
            console.error("Failed to delete goal:", error);
            alert("Failed to delete goal");
        }
    };

    const getProgressPercentage = (goal: Goal) => {
        if (goal.targetType === "percentage" && goal.baseline) {
            return ((goal.baseline - goal.current) / goal.baseline) * 100;
        }
        return (goal.current / goal.target) * 100;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 md:p-10 container mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-heading mb-2">Goals & Targets</h1>
                    <p className="text-muted-foreground">Track your sustainability objectives</p>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Goal
                </Button>
            </div>

            {showCreateForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Goal</CardTitle>
                            <CardDescription>Set a new sustainability target</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateGoal} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="title">Goal Title *</Label>
                                        <Input
                                            id="title"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g., Reduce Energy Consumption"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="category">Category *</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="energy">Energy</SelectItem>
                                                <SelectItem value="transport">Transport</SelectItem>
                                                <SelectItem value="waste">Waste</SelectItem>
                                                <SelectItem value="supply_chain">Supply Chain</SelectItem>
                                                <SelectItem value="general">General</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe your goal..."
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <Label htmlFor="target">Target Value *</Label>
                                        <Input
                                            id="target"
                                            type="number"
                                            required
                                            value={formData.target}
                                            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                            placeholder="e.g., 25"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="targetType">Target Type *</Label>
                                        <Select
                                            value={formData.targetType}
                                            onValueChange={(value) => setFormData({ ...formData, targetType: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage Reduction</SelectItem>
                                                <SelectItem value="absolute">Absolute Value</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="deadline">Deadline *</Label>
                                        <Input
                                            id="deadline"
                                            type="date"
                                            required
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {formData.targetType === "percentage" && (
                                    <div>
                                        <Label htmlFor="baseline">Baseline Value (optional)</Label>
                                        <Input
                                            id="baseline"
                                            type="number"
                                            value={formData.baseline}
                                            onChange={(e) => setFormData({ ...formData, baseline: e.target.value })}
                                            placeholder="e.g., 1000"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        <Check className="mr-2 h-4 w-4" />
                                        Create Goal
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {goals.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="pt-10 pb-10 text-center">
                            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <h2 className="text-xl font-bold mb-2">No Goals Yet</h2>
                            <p className="text-muted-foreground mb-4">
                                Set your first sustainability goal to start tracking progress
                            </p>
                            <Button onClick={() => setShowCreateForm(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First Goal
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    goals.map((goal) => {
                        const progress = getProgressPercentage(goal);
                        const isOverdue = goal.status === "overdue";
                        const isCompleted = goal.status === "completed";

                        return (
                            <motion.div
                                key={goal._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Card className={isCompleted ? "border-green-500/50 bg-green-500/5" : isOverdue ? "border-red-500/50 bg-red-500/5" : ""}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{goal.title}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                                                </CardDescription>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteGoal(goal._id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {goal.description && (
                                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                                        )}

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium">Progress</span>
                                                <span className="text-muted-foreground">{Math.min(progress, 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${isCompleted ? "bg-green-500" : "bg-primary"}`}
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-medium ${isCompleted ? "bg-green-500/20 text-green-700" :
                                                    isOverdue ? "bg-red-500/20 text-red-700" :
                                                        "bg-primary/20 text-primary"
                                                }`}>
                                                {goal.status}
                                            </div>
                                        </div>

                                        <div className="text-sm">
                                            <span className="font-medium">Target: </span>
                                            <span className="text-muted-foreground">
                                                {goal.target}{goal.targetType === "percentage" ? "% reduction" : " tCO2e"}
                                            </span>
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
