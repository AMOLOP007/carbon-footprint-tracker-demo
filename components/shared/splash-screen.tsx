"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Leaf, Globe, Activity, Wind, Droplets } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Sequence: 
        // 0: Init
        // 1: Logo Assemble (1s)
        // 2: Text Reveal (1.5s)
        // 3: Loading Spinner (2s)
        // 4: Exit
        const timer1 = setTimeout(() => setStep(1), 500);
        const timer2 = setTimeout(() => setStep(2), 1800);
        const timer3 = setTimeout(() => {
            onComplete();
        }, 3800);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            <div className="relative flex flex-col items-center justify-center">

                {/* Logo Construction Animation */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <AnimatePresence>
                        {step >= 1 && (
                            <>
                                <motion.div
                                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0 }}
                                    className="absolute inset-0 flex items-center justify-center text-primary/80"
                                >
                                    <Leaf className="w-24 h-24" strokeWidth={1.5} />
                                </motion.div>
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                                    className="absolute inset-0 flex items-center justify-center text-emerald-400/50 mix-blend-multiply dark:mix-blend-screen"
                                >
                                    <Globe className="w-20 h-20" strokeWidth={1} />
                                </motion.div>
                                <motion.div
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
                                    className="absolute -inset-4 border-2 border-primary/20 rounded-full"
                                />
                            </>
                        )}
                    </AnimatePresence>

                    {/* Orbiting Particles */}
                    {step >= 1 && (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-8"
                        >
                            <div className="absolute top-0 left-1/2 w-3 h-3 bg-primary rounded-full blur-[2px]" />
                            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-emerald-400 rounded-full blur-[1px]" />
                        </motion.div>
                    )}
                </div>

                {/* Text Reveal */}
                <div className="mt-12 h-12 overflow-hidden relative">
                    <AnimatePresence>
                        {step >= 2 && (
                            <motion.h1
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="text-4xl font-heading font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-accent"
                            >
                                AETHERRA
                            </motion.h1>
                        )}
                    </AnimatePresence>
                </div>

                {/* Loading Status */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: step >= 2 ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-4 flex flex-col items-center gap-2"
                >
                    <div className="flex gap-1">
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
