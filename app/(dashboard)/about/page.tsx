"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Leaf, Target, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function AboutPage() {
    return (
        <motion.div
            className="flex flex-col gap-8 p-6 md:p-10 container mx-auto max-w-5xl"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <motion.div variants={item} className="text-center space-y-4">
                <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full mb-4">
                    <Leaf className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-5xl font-bold font-heading">About Aetherra</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Enterprise Carbon Tracking & Sustainability Intelligence Platform
                </p>
            </motion.div>

            <motion.div variants={item}>
                <Card>
                    <CardHeader>
                        <CardTitle>Our Mission</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            Aetherra empowers organizations to measure, analyze, and reduce their carbon footprint through
                            intelligent data-driven insights. We believe that sustainability is not just a responsibility—it's
                            a competitive advantage.
                        </p>
                        <p>
                            Our platform combines advanced AI analytics with intuitive user experience to make carbon
                            tracking accessible, actionable, and impactful.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item} className="grid gap-6 md:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <Target className="h-8 w-8 text-primary mb-2" />
                        <CardTitle>Precision Tracking</CardTitle>
                        <CardDescription>
                            Accurate emissions calculations across electricity, vehicles, shipping, and supply chains
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <Zap className="h-8 w-8 text-primary mb-2" />
                        <CardTitle>AI-Powered Insights</CardTitle>
                        <CardDescription>
                            Intelligent recommendations to optimize operations and reduce environmental impact
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <Shield className="h-8 w-8 text-primary mb-2" />
                        <CardTitle>Data Security</CardTitle>
                        <CardDescription>
                            Enterprise-grade encryption and compliance with global sustainability reporting standards
                        </CardDescription>
                    </CardHeader>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardHeader>
                        <CardTitle>Why Sustainability Matters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            Climate change is the defining challenge of our generation. Businesses play a crucial role in
                            the transition to a sustainable future. By tracking and reducing emissions, organizations can:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Meet regulatory requirements and avoid penalties</li>
                            <li>Reduce operational costs through energy efficiency</li>
                            <li>Enhance brand reputation and customer trust</li>
                            <li>Attract environmentally-conscious investors and talent</li>
                            <li>Contribute to global climate goals</li>
                        </ul>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item} className="text-center text-sm text-muted-foreground border-t pt-6">
                <p>Aetherra v1.0.0 • Built with Next.js, MongoDB, and AI</p>
                <p className="mt-2">© 2026 Aetherra • Making sustainability accessible to everyone</p>
            </motion.div>
        </motion.div>
    );
}
