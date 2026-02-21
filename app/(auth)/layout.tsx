import { AnimatedBackground } from "@/components/shared/animated-background";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center relative">
            <AnimatedBackground variant="auth" />
            <div className="w-full max-w-md p-4 z-10">
                {children}
            </div>
        </div>
    );
}
