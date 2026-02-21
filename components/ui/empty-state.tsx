import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                <div className="mb-4 p-3 bg-muted rounded-full">
                    {icon}
                </div>
                <CardTitle className="text-xl mb-2 text-center">{title}</CardTitle>
                <CardDescription className="text-center max-w-sm mb-6">
                    {description}
                </CardDescription>
                {action && <div>{action}</div>}
            </CardContent>
        </Card>
    );
}
