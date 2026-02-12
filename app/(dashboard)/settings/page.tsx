"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, User, Bell, Shield, LogOut, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
    const { setTheme } = useTheme();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            const response = await fetch("/api/logout", {
                method: "POST",
            });

            if (response.ok) {
                // Clear local storage
                if (typeof window !== 'undefined') {
                    localStorage.clear();
                    sessionStorage.clear();
                }

                // Redirect to login
                router.push("/login");
            } else {
                alert("Logout failed. Please try again.");
            }
        } catch (error) {
            console.error("Logout error:", error);
            alert("Logout failed. Please try again.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl space-y-8 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold font-heading mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and application settings.</p>
            </motion.div>

            <Tabs defaultValue="appearance" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <TabsContent value="appearance" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Theme Preferences</CardTitle>
                                <CardDescription>Select your preferred interface theme.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-3">
                                <div className="cursor-pointer" onClick={() => setTheme("light")}>
                                    <div className="rounded-lg border-2 border-muted hover:border-primary p-2 h-24 bg-white mb-2 flex items-center justify-center text-black">
                                        <Sun className="h-6 w-6" />
                                    </div>
                                    <p className="text-center text-sm font-medium">Light</p>
                                </div>
                                <div className="cursor-pointer" onClick={() => setTheme("dark")}>
                                    <div className="rounded-lg border-2 border-muted hover:border-primary p-2 h-24 bg-slate-950 mb-2 flex items-center justify-center text-white">
                                        <Moon className="h-6 w-6" />
                                    </div>
                                    <p className="text-center text-sm font-medium">Dark</p>
                                </div>
                                <div className="cursor-pointer" onClick={() => setTheme("system")}>
                                    <div className="rounded-lg border-2 border-muted hover:border-primary p-2 h-24 bg-gradient-to-br from-white to-slate-950 mb-2 flex items-center justify-center text-slate-500">
                                        <Monitor className="h-6 w-6" />
                                    </div>
                                    <p className="text-center text-sm font-medium">System</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="profile" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input defaultValue="Admin User" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input defaultValue="admin@aetherra.com" disabled />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Company</Label>
                                        <Input defaultValue="Acme Corp" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Input defaultValue="Sustainability Manager" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Configure how you receive alerts.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Email Alerts</Label>
                                            <p className="text-sm text-muted-foreground">Receive daily summaries and high-priority alerts.</p>
                                        </div>
                                        <Input type="checkbox" className="h-4 w-4" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">AI Insights</Label>
                                            <p className="text-sm text-muted-foreground">Get notified when AI detects reduction opportunities.</p>
                                        </div>
                                        <Input type="checkbox" className="h-4 w-4" defaultChecked />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="account" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Management</CardTitle>
                                <CardDescription>Manage your account settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Logout</Label>
                                        <p className="text-sm text-muted-foreground">Sign out of your account</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        {isLoggingOut ? "Logging out..." : "Logout"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-destructive/50">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                <CardDescription>Irreversible actions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-destructive">Delete Account</Label>
                                        <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                                    </div>
                                    <Button variant="destructive" disabled>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Account
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </motion.div>
            </Tabs>
        </div>
    );
}
