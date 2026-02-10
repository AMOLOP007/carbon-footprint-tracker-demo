import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className={cn("w-10 h-10", className)}
            fill="none"
            {...props}
        >
            <defs>
                <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0F766E" /> {/* Deep Teal */}
                    <stop offset="100%" stopColor="#10B981" /> {/* Emerald */}
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Leaf Shape Container */}
            <path
                d="M50 5 
           C20 5, 5 20, 5 50 
           C5 80, 20 95, 50 95 
           C80 95, 95 80, 95 50 
           C95 20, 80 5, 50 5 Z"
                className="stroke-primary/50"
                strokeWidth="1"
                fill="none"
                opacity="0.2"
            />

            {/* Main Stylized Leaf Node Network */}
            <g filter="url(#glow)">
                {/* Leaf Outline */}
                <path
                    d="M50 10 
             C25 10, 10 30, 20 60 
             C30 90, 70 90, 80 60
             C90 30, 75 10, 50 10 Z"
                    stroke="url(#leafGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Veins / Network Lines */}
                <path
                    d="M20 60 C30 50, 40 40, 50 10" // Main vein up
                    stroke="url(#leafGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    d="M20 60 C35 60, 45 50, 80 60" // Cross vein
                    stroke="url(#leafGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                {/* Tech Nodes (Dots) */}
                <circle cx="20" cy="60" r="3" fill="#10B981" />
                <circle cx="50" cy="10" r="3" fill="#10B981" />
                <circle cx="80" cy="60" r="3" fill="#10B981" />
                <circle cx="35" cy="45" r="2" fill="#0F766E" />
                <circle cx="60" cy="35" r="2" fill="#0F766E" />
            </g>
        </svg>
    );
}
