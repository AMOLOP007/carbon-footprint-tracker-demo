"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LayoutDashboard, Calculator, User, Settings, LogOut, Sparkles, PieChart } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";

const sidebarItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Emissions Calculator", href: "/calculator", icon: Calculator },
    { name: "Reports & Analytics", href: "/reports", icon: PieChart },
    { name: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
    { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    const handleLogout = () => {
        // Clear cookie
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        window.location.href = "/login";
    };

    return (
        <div className={cn("pb-12 h-screen border-r bg-card hidden lg:block w-64 fixed left-0 top-0 z-50", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <Link href="/" className="flex items-center px-4 mb-6 hover:opacity-80 transition-opacity">
                        <Logo className="h-8 w-8 mr-2" />
                        <h2 className="text-2xl font-bold tracking-tight font-heading">
                            Aetherra
                        </h2>
                    </Link>
                    <div className="space-y-1">
                        {sidebarItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    className="w-full justify-start relative overflow-hidden"
                                >
                                    {pathname === item.href && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute inset-0 bg-primary/10 border-r-2 border-primary"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className="mr-2 h-4 w-4 z-10" />
                                    <span className="z-10">{item.name}</span>
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <div className="absolute bottom-4 left-0 w-full px-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
                <div className="space-y-4 py-4 h-full bg-card">
                    <div className="px-3 py-2">
                        <Link href="/" className="flex items-center px-4 mb-6 hover:opacity-80 transition-opacity" onClick={() => setOpen(false)}>
                            <Logo className="h-8 w-8 mr-2" />
                            <h2 className="text-2xl font-bold tracking-tight font-heading">Aetherra</h2>
                        </Link>
                        <div className="space-y-1">
                            {sidebarItems.map((item) => (
                                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                                    <Button
                                        variant={pathname === item.href ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                    >
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.name}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
