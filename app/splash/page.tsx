"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Leaf, Globe, Wind, Droplets, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SplashPage() {
    const [step, setStep] = useState(0);
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Generate particles client-side only (fix hydration mismatch)
        setParticles(Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1,
            duration: Math.random() * 20 + 10,
            delay: Math.random() * 5,
        })));

        // Sequence: Init -> Logo Buildup -> Heavy Text Reveal -> Choice UI
        const t1 = setTimeout(() => setStep(1), 500);
        const t2 = setTimeout(() => setStep(2), 2500);
        const t3 = setTimeout(() => setStep(3), 4500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);



    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white selection:bg-primary/30">
            {/* --- HEAVY ANIMATED BACKGROUND --- */}

            {/* Deep Space Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black z-0" />

            {/* Nebulas */}
            <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"
            />
            <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
                className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none"
            />

            {/* Starfield / Particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute bg-white rounded-full opacity-20"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 0.8, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* --- MAIN CONTENT --- */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-4">

                {/* 1. Core Reactor / Logo Animation */}
                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                    <AnimatePresence>
                        {step >= 1 && (
                            <>
                                {/* Spinning Rings */}
                                <motion.div
                                    initial={{ scale: 0, opacity: 0, rotateX: 60, rotateY: 60 }}
                                    animate={{ scale: 1, opacity: 0.5, rotateX: 180, rotateY: 180 }}
                                    transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
                                    className="absolute inset-0 border-4 border-dashed border-emerald-500/30 rounded-full"
                                />
                                <motion.div
                                    initial={{ scale: 0, opacity: 0, rotateX: -60, rotateY: -60 }}
                                    animate={{ scale: 1.2, opacity: 0.3, rotateX: -180, rotateY: -180 }}
                                    transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
                                    className="absolute inset-0 border-2 border-dotted border-primary/30 rounded-full"
                                />

                                {/* Central Logo Assembly */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -360 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    className="relative z-20 bg-black/50 backdrop-blur-md p-6 rounded-full border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                                >
                                    <Leaf className="w-20 h-20 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" strokeWidth={1.5} />
                                </motion.div>

                                {/* Energy Pulse */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 2, opacity: 0 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                    className="absolute inset-0 bg-emerald-500/20 rounded-full z-10"
                                />
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. Text Reveal (Cinematic) */}
                <div className="h-32 mb-8 flex flex-col items-center justify-center overflow-hidden">
                    <AnimatePresence>
                        {step >= 2 && (
                            <>
                                <motion.h1
                                    initial={{ y: 100, opacity: 0, letterSpacing: "1em" }}
                                    animate={{ y: 0, opacity: 1, letterSpacing: "0.2em" }}
                                    transition={{ duration: 1.2, ease: "circOut" }}
                                    className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 text-center drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                                >
                                    AETHERRA
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1, duration: 1 }}
                                    className="mt-4 text-emerald-400/80 text-lg uppercase tracking-[0.3em] font-light"
                                >
                                    Sustainable Intelligence
                                </motion.p>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. Action Buttons */}
                <AnimatePresence mode="wait">
                    {step >= 3 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex flex-col sm:flex-row gap-6 w-full max-w-md mt-16"
                        >
                            <Link href="/login" className="w-full">
                                <Button className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] border border-emerald-400/20 group">
                                    Login to Portal
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/register" className="w-full">
                                <Button variant="outline" className="w-full h-14 text-lg border-white/20 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all hover:scale-105">
                                    Create Account
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="h-14" // Spacer to prevent layout shift
                            animate={{ opacity: 0 }}
                        />
                    )}
                </AnimatePresence>

                {/* Footer Tech Elements */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: step >= 2 ? 1 : 0 }}
                    transition={{ duration: 2 }}
                    className="relative mt-16 left-0 right-0 flex justify-center gap-8 text-white/20 text-xs uppercase tracking-widest"
                >
                    <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3" /> Global Data
                    </div>
                    <div className="flex items-center gap-2">
                        <Wind className="w-3 h-3" /> Real-time Anaytics
                    </div>
                    <div className="flex items-center gap-2">
                        <Droplets className="w-3 h-3" /> Impact Tracking
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
