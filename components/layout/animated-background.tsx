"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedBackgroundProps {
    variant?: "default" | "auth" | "dashboard";
}

export function AnimatedBackground({ variant = "default" }: AnimatedBackgroundProps) {
    const isAuth = variant === "auth";
    const [particles, setParticles] = useState<{ id: number; style: any; animate: any; transition: any }[]>([]);

    useEffect(() => {
        const newParticles = [...Array(15)].map((_, i) => ({
            id: i,
            style: {
                width: Math.random() * 3 + 1 + "px",
                height: Math.random() * 3 + 1 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
            },
            animate: {
                y: [0, -150],
                opacity: [0, 0.8, 0],
            },
            transition: {
                duration: Math.random() * 15 + 15,
                repeat: Infinity,
                delay: Math.random() * 20,
                ease: "linear",
            }
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-background">
            {/* Organic Warp 1 */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, -50, 0],
                    y: [0, 30, -30, 0],
                    rotate: [0, 10, -10, 0]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className={`absolute ${isAuth ? 'top-[-20%] left-[-10%]' : 'top-0 left-0'} w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] opacity-40`}
            />

            {/* Organic Warp 2 */}
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    x: [0, -50, 50, 0],
                    y: [0, 80, 0],
                    rotate: [0, -20, 20, 0]
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className={`absolute ${isAuth ? 'bottom-[-20%] right-[-10%]' : 'bottom-0 right-0'} w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] opacity-30`}
            />

            {/* Floating Particles - Client Only */}
            <div className="absolute inset-0 opacity-20">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute bg-current rounded-full text-primary"
                        style={p.style}
                        animate={p.animate}
                        transition={p.transition}
                    />
                ))}
            </div>

            {/* Subtle Grid - Optional based on design */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        </div>
    );
}
