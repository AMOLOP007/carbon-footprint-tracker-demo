"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { User, Settings, LogOut } from "lucide-react";

// Deterministic color generator based on string
const getThemeColor = (str: string) => {
    const colors = [
        ["#10b981", "#3b82f6"], // Emerald -> Blue
        ["#8b5cf6", "#d946ef"], // Violet -> Fuchsia
        ["#f59e0b", "#ef4444"], // Amber -> Red
        ["#06b6d4", "#3b82f6"], // Cyan -> Blue
        ["#10b981", "#059669"], // Emerald -> Dark Emerald
        ["#6366f1", "#a855f7"], // Indigo -> Purple
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export function UserNav() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    const user = session?.user;
    const name = user?.name || "User";
    const email = user?.email || "";
    const initials = name.slice(0, 2).toUpperCase();

    const [color1, color2] = getThemeColor(email || name);

    // Custom "Aetherra" Avatar: A simple, sleek gradient with initials
    // This fits the "theme" better than random pixel art

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                    <div
                        className="h-full w-full flex items-center justify-center text-sm font-bold text-white shadow-inner"
                        style={{
                            background: `linear-gradient(135deg, ${color1}, ${color2})`
                        }}
                    >
                        {initials}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{name}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                            {email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
