"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { toast } from "sonner"; // Assuming sonner is installed, if not will use alert or just console

import { signIn } from "next-auth/react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Store token in cookie (simple client-side for demo)
                document.cookie = `token=${data.token}; path=/`;
                window.location.href = "/";
            } else {
                alert(data.message || "Invalid credentials");
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert("Login failed. Check console.");
        }
    };

    const handleSocialLogin = async (provider: string) => {
        setLoading(true);
        // Map provider names to NextAuth provider IDs
        const providerId = provider.toLowerCase() === "microsoft" ? "azure-ad" : provider.toLowerCase();

        // Use standard NextAuth signIn function
        await signIn(providerId, { callbackUrl: "/" });
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Animated Background Blobs */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 0.5,
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 0.5,
                    scale: [1, 1.3, 1],
                    rotate: [0, -90, 0],
                }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md px-4"
            >
                <Card className="glass-dark border-primary/20 shadow-2xl backdrop-blur-xl bg-card/60">
                    <CardHeader className="space-y-1 text-center">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="flex justify-center mb-4"
                        >
                            <div className="p-4 rounded-full bg-primary/10 ring-1 ring-primary/20 shadow-lg shadow-primary/5">
                                <Logo className="h-10 w-10" />
                            </div>
                        </motion.div>
                        <CardTitle className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                            Welcome Back
                        </CardTitle>
                        <CardDescription>
                            Enter your credentials to access the sustainable future.
                            <br />
                            <span
                                className="text-primary font-medium cursor-pointer hover:underline block mt-2 opacity-80 hover:opacity-100 transition-opacity"
                                onClick={() => { setEmail("demo@aetherra.com"); setPassword("demo123"); }}
                            >
                                Click to fill Test Credentials
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative group">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        required
                                        className="bg-background/50 border-input group-hover:border-primary/50 transition-colors focus:ring-primary/20"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="#" className="text-xs text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        className="bg-background/50 border-input group-hover:border-primary/50 transition-colors focus:ring-primary/20"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                                </Button>
                            </motion.div>
                        </form>

                        {/* Social Login Options */}
                        <div className="relative pt-6 pb-2">
                            <div className="absolute inset-0 flex items-center pt-4">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase pt-4">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" type="button" onClick={() => handleSocialLogin("Google")} className="w-full hover:bg-primary/10 transition-colors">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" opacity="0.1" />
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </Button>
                            <Button variant="outline" type="button" onClick={() => handleSocialLogin("Apple")} className="w-full hover:bg-primary/10 transition-colors">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.56-2.09-.48-3.08.35 1.04 1.79 4.3 2.5 6.16 2.5" />
                                    <path d="M17.65 1.83c.12 1.95-1.57 3.51-3.23 3.33-.2-.56.12-2.3 3.23-3.33zM3.48 4.2C1.96 6.84.66 10.4.66 13.91c0 6.64 4.54 10.09 4.54 10.09.89-1.35 1.4-1.97 1.4-1.97-1.9-1.12-2.73-3.06-2.5-5.59.81.42 1.62.66 2.44.72 1.05.08 2.37-.17 3.4-1.08.61-.54 1.11-1.29 1.47-1.93-.41-.58-.93-1.2 1.55-1.85.79-.83 1.74-1.83 2.83-2.95 2.54-2.63 2.7-4.47 2.7-4.47 0-1.07-.38-1.97-1.14-2.67-.75-.7-1.76-1.07-3.03-1.12-.87-.04-1.73.2-2.58.73l-.63.4-.67-.39c.92-.54 1.94-.8 3.04-.78 1.44.02 2.76.65 3.54 1.85-1.06.66-1.8 1.44-2.22 2.31-.42.88-.63 1.85-.63 2.92 0 1.9.91 3.49 2.73 4.77 1.01.71 1.97 1.05 2.87 1.09-1.28 2.4-3.1 4.73-5.46 7.03-.89-1.34-1.4-1.96-1.4-1.96 1.9-1.13 2.74-3.06 2.5-5.59-.81.42-1.62.66-2.43.72-1.05.08-2.37-.17-3.41-1.08-.61-.54-1.1-1.29-1.47-1.93.41-.58.93-1.2 1.55-1.85.79-.83 1.74-1.83 2.83-2.95 2.54-2.63 2.7-4.47 2.7-4.47 0-1.07-.38-1.97-1.14-2.67-.75-.7-1.76-1.07-3.03-1.12-.87-.04-1.73.2-2.58.73l-.63.4-.67-.39c-.91-.53-1.92-.79-3.04-.77-1.44.02-2.76.65-3.54 1.85z" />
                                </svg>
                            </Button>
                            <Button variant="outline" type="button" onClick={() => handleSocialLogin("Microsoft")} className="w-full hover:bg-primary/10 transition-colors">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 23 23">
                                    <path fill="#f35325" d="M1 1h10v10H1z" />
                                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                                </svg>
                            </Button>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Register
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
