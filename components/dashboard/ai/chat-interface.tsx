"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LeafIcon } from "@/components/ui/leaf-icon";
import { toast } from "sonner";

type Message = {
    _id?: string;
    role: "user" | "assistant";
    content: string;
    timestamp?: Date;
};

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // Initial greeting if no messages
    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const res = await fetch("/api/chat");
            const data = await res.json();
            if (data.success && data.messages.length > 0) {
                setMessages(data.messages);
            } else {
                setMessages([{
                    role: "assistant",
                    content: "Hello! I'm Aetherra, your intelligent sustainability guide. I can help analyze your shipping routes, suggest carbon reduction strategies, or explain complex emission factors. How can I assist you today?"
                }]);
            }
        } catch (e) {
            console.error("Failed to fetch chat history", e);
            // Fallback if API fails
            setMessages([{
                role: "assistant",
                content: "I'm having trouble connecting to the server, but I'm ready to help! (Offline Mode)"
            }]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping, isLoadingHistory]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // Get context from local storage if available (mock implementation)
            // In a real app, we'd pull from a global store or recent API calls
            const context = { recentCalc: null };

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.content, context }),
            });

            const data = await res.json();

            if (data.success) {
                setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
            } else {
                toast.error("Failed to get response");
            }
        } catch (error) {
            console.error(error);
            toast.error("Connection error");
            setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble reaching the server right now. Please try again later." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleReset = () => {
        setMessages([{
            role: "assistant",
            content: "Conversation cleared. How can I help you regarding your new projects?"
        }]);
    };

    return (
        <Card className="h-[calc(100vh-14rem)] flex flex-col border-primary/20 shadow-xl glass-dark overflow-hidden">
            <CardHeader className="border-b border-primary/10 pb-4 flex flex-row items-center justify-between bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-full bg-primary/10 ring-1 ring-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <LeafIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-heading bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
                            Aetherra Intelligence
                        </CardTitle>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Neural Engine Active
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleReset} title="Clear Context">
                    <RefreshCw className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden relative bg-[url('/grid.svg')] bg-[length:50px_50px] bg-fixed">
                <ScrollArea className="h-full px-4 py-4">
                    <div className="space-y-6 pb-4">
                        {isLoadingHistory ? (
                            <div className="flex justify-center items-center h-full py-20 opacity-50">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className={cn(
                                        "flex w-max max-w-[85%] flex-col gap-1.5 rounded-2xl px-5 py-3.5 text-sm shadow-sm",
                                        msg.role === "user"
                                            ? "ml-auto bg-gradient-to-br from-primary to-emerald-700 text-white rounded-br-none shadow-lg shadow-primary/10"
                                            : "bg-background/80 backdrop-blur-md border border-border/50 rounded-bl-none text-foreground/90 shadow-sm"
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1 opacity-70 text-[10px] uppercase tracking-wider font-bold">
                                        {msg.role === "user" ? <User size={10} /> : <LeafIcon className="h-3 w-3" />}
                                        {msg.role === "user" ? "You" : "Aetherra AI"}
                                    </div>
                                    <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                                </motion.div>
                            ))
                        )}
                        {messages.length === 0 && !isLoadingHistory && (
                            <div className="text-center text-muted-foreground py-10">
                                No messages yet. Start a conversation!
                            </div>
                        )}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex w-max gap-3 rounded-2xl bg-background/80 backdrop-blur-md px-5 py-4 text-sm rounded-bl-none items-center border border-border/50"
                            >
                                <LeafIcon className="h-4 w-4 animate-pulse opacity-50 text-primary" />
                                <div className="flex gap-1 h-2 items-center">
                                    <motion.div className="w-1.5 h-1.5 bg-primary/70 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                                    <motion.div className="w-1.5 h-1.5 bg-primary/70 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                                    <motion.div className="w-1.5 h-1.5 bg-primary/70 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                                </div>
                            </motion.div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t border-primary/10 pt-4 pb-4 bg-background/50 backdrop-blur-sm">
                <form
                    className="flex w-full items-center gap-2 relative"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                >
                    <Input
                        placeholder="Ask about emissions, reduction strategies, or shipping..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-background/50 focus-visible:ring-primary pr-12 h-12 rounded-xl"
                        disabled={isTyping}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isTyping}
                        className="absolute right-1 top-1 h-10 w-10 bg-primary hover:bg-primary/90 transition-all hover:scale-105 rounded-lg"
                    >
                        {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
