"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        password: ""
    });

    const handleSocialLogin = async (provider: string) => {
        setLoading(true);
        // Simulate OAuth Popup
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            "",
            "Social Login",
            `width=${width},height=${height},left=${left},top=${top}`
        );

        if (popup) {
            popup.document.write(`
                <html>
                    <head><title>Sign up with ${provider}</title></head>
                    <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-family:sans-serif;background:#000;color:#fff;">
                        <h2 style="color:#10b981">Connecting to ${provider}...</h2>
                        <p>Creating account...</p>
                        <script>
                            setTimeout(() => {
                                window.close();
                            }, 2000);
                        </script>
                    </body>
                </html>
            `);

            // Poll for popup closure or wait
            const timer = setInterval(() => {
                if (popup.closed) {
                    clearInterval(timer);
                    // Simulate successful login
                    completeSocialLogin(provider);
                }
            }, 500);
        }
    };

    const completeSocialLogin = (provider: string) => {
        // Mock login success
        document.cookie = `token=mock-jwt-token-social-${provider}; path=/`;
        window.location.href = "/";
    };

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 2));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

    const handleRegister = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                // Auto login or redirect to login
                window.location.href = "/login";
            } else {
                alert(data.message || "Registration failed");
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert("Registration failed");
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Animated Background Blobs - LIGHTER VARIANT */}
            <motion.div
                animate={{
                    opacity: 0.25, // Very Light
                    scale: [1, 1.3, 1],
                    rotate: [0, -60, 0],
                }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="absolute -top-60 -left-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-40 pointer-events-none"
            />
            <motion.div
                animate={{
                    opacity: 0.25, // Very Light
                    scale: [1, 1.2, 1],
                    rotate: [0, 60, 0],
                }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-emerald-200/10 rounded-full blur-3xl opacity-40 pointer-events-none dark:bg-emerald-900/10"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-lg px-4"
            >
                <Card className="glass-card border-white/10 shadow-2xl backdrop-blur-xl bg-card/60">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                            Create an Account
                        </CardTitle>
                        <CardDescription>Begin your journey to net zero.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Progress Bar */}
                        <div className="relative h-1 w-full bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary to-accent"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((step + 1) / 3) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 min-h-[220px]">
                            <AnimatePresence mode="wait">
                                {step === 0 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-background/50 border-input focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company Name</Label>
                                            <Input
                                                id="company"
                                                placeholder="EcoCorp Inc."
                                                required
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                className="bg-background/50 border-input focus:ring-primary/20"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                                {step === 1 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="name@company.com"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="bg-background/50 border-input focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="bg-background/50 border-input focus:ring-primary/20"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                                {step === 2 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col items-center justify-center space-y-4 py-4"
                                    >
                                        <div className="p-4 rounded-full bg-primary/20 mb-2">
                                            <CheckCircle2 className="h-8 w-8 text-primary" />
                                        </div>
                                        <p className="text-center text-muted-foreground">
                                            Review your details and complete registration.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        <div className="flex justify-between pt-2">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={step === 0 || loading}
                                className="opacity-0 disabled:opacity-0 data-[visible=true]:opacity-100 transition-opacity"
                                data-visible={step > 0}
                            >
                                Back
                            </Button>

                            {step < 2 ? (
                                <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleRegister} disabled={loading} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Registration"}
                                </Button>
                            )}
                        </div>

                        <div className="relative pt-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or sign up with
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pb-2">
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
                                    <path d="M17.65 1.83c.12 1.95-1.57 3.51-3.23 3.33-.2-.56.12-2.3 3.23-3.33zM3.48 4.2C1.96 6.84.66 10.4.66 13.91c0 6.64 4.54 10.09 4.54 10.09.89-1.35 1.4-1.97 1.4-1.97-1.9-1.12-2.73-3.06-2.5-5.59.81.42 1.62.66 2.44.72 1.05.08 2.37-.17 3.4-1.08.61-.54 1.11-1.29 1.47-1.93-.41-.58-.93-1.2 1.55-1.85.79-.83 1.74-1.83 2.83-2.95 2.54-2.63 2.7-4.47 2.7-4.47 0-1.07-.38-1.97-1.14-2.67-.75-.7-1.76-1.07-3.03-1.12-.87-.04-1.73.2-2.58.73l.63.4-.67-.39c.92-.54 1.94-.8 3.04-.78 1.44.02 2.76.65 3.54 1.85-1.06.66-1.8 1.44-2.22 2.31-.42.88-.63 1.85-.63 2.92 0 1.9.91 3.49 2.73 4.77 1.01.71 1.97 1.05 2.87 1.09-1.28 2.4-3.1 4.73-5.46 7.03-.89-1.34-1.4-1.96-1.4-1.96 1.9-1.13 2.74-3.06 2.5-5.59-.81.42-1.62.66-2.43.72-1.05.08-2.37-.17-3.41-1.08-.61-.54-1.1-1.29-1.47-1.93.41-.58.93-1.2 1.55-1.85.79-.83 1.74-1.83 2.83-2.95 2.54-2.63 2.7-4.47 2.7-4.47 0-1.07-.38-1.97-1.14-2.67-.75-.7-1.76-1.07-3.03-1.12-.87-.04-1.73.2-2.58.73l.63.4-.67-.39c.92-.54 1.94-.8 3.04-.78 1.44.02 2.76.65 3.54 1.85z" />
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
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
