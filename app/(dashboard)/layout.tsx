import { Sidebar, MobileSidebar } from "@/components/dashboard/layout/sidebar";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { UserNav } from "@/components/dashboard/layout/user-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/20">
            <AnimatedBackground variant="dashboard" />
            <Sidebar />
            <div className="lg:pl-64 flex flex-col min-h-screen relative z-10">
                <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/60 px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                    <MobileSidebar />
                    <div className="flex flex-1 items-center justify-between">
                        <div />
                        <UserNav />
                    </div>
                </header>
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
