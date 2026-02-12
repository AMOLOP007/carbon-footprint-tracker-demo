"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserPlus, Mail, Shield, Award, Code, Palette, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const coreTeam = [
    {
        name: "Amol Manish Tamhankar",
        role: "Founder & Lead Architect",
        icon: Award,
        color: "text-primary",
        bg: "bg-primary/10",
        isSystem: true
    },
    {
        name: "Rudra Thakur",
        role: "AI & Backend Engineer",
        icon: Code,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        isSystem: true
    },
    {
        name: "Onkar Vagere",
        role: "Frontend & UX Engineer",
        icon: Palette,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        isSystem: true
    },
    {
        name: "Rohan Shedge",
        role: "Data & Systems Engineer",
        icon: Database,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        isSystem: true
    }
];

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

export default function TeamPage() {
    return (
        <div className="flex flex-col gap-6 p-6 md:p-10 container mx-auto max-w-7xl">
            <div>
                <h1 className="text-4xl font-bold font-heading mb-2">Team / Organization</h1>
                <p className="text-muted-foreground">Manage team members and organizational settings</p>
            </div>

            {/* Core Team Section */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
            >
                <h2 className="text-2xl font-semibold mb-4">Core Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {coreTeam.map((member, i) => (
                        <motion.div key={i} variants={item}>
                            <Card className="hover:shadow-lg transition-all border-l-4 h-full" style={{ borderLeftColor: member.color.replace('text-', '') }}>
                                <CardHeader className="space-y-3">
                                    <div className={`p-3 rounded-full ${member.bg} w-fit`}>
                                        <member.icon className={`h-6 w-6 ${member.color}`} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{member.name}</CardTitle>
                                        <CardDescription>{member.role}</CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Collaboration Features (Coming Soon) */}
            <Card className="border-dashed mt-6">
                <CardHeader className="text-center pb-12 pt-12">
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Team Collaboration</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                        Invite team members to collaborate on sustainability initiatives. This feature will be available in a future update.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-12">
                    <Button disabled>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Team Members (Coming Soon)
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <CardTitle>Roles & Permissions</CardTitle>
                        </div>
                        <CardDescription>Configure access levels for team members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Feature coming soon</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                        <CardDescription>Set up team-wide notifications and alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Feature coming soon</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
