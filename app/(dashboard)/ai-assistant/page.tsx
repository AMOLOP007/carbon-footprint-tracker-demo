"use client";

import { motion } from "framer-motion";
import ChatInterface from "@/components/dashboard/ai/chat-interface";

export default function AIAssistantPage() {
    return (
        <div className="container mx-auto max-w-5xl h-full flex flex-col gap-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold font-heading mb-2">AI Sustainability Assistant</h1>
                <p className="text-muted-foreground">
                    Get real-time insights, reduction strategies, and predictive analysis powered by Aetherra AI.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-1"
            >
                <ChatInterface />
            </motion.div>
        </div>
    );
}
