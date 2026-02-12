import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    );
}

// Dashboard skeleton
export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-8 p-6 md:p-10 container mx-auto max-w-7xl">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-3 p-6 border rounded-lg">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-3 w-full" />
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-7">
                <div className="col-span-5 space-y-4 p-6 border rounded-lg">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-[350px] w-full" />
                </div>
                <div className="col-span-2 space-y-4 p-6 border rounded-lg">
                    <Skeleton className="h-6 w-32" />
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-2 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-4">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-8 w-8" />
                </div>
            ))}
        </div>
    );
}

// Card skeleton
export function CardSkeleton() {
    return (
        <div className="space-y-4 p-6 border rounded-lg">
            <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    );
}
