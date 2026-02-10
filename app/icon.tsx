import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    fill="none"
                    style={{ width: '100%', height: '100%' }}
                >
                    <defs>
                        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0F766E" />
                            <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                    </defs>

                    {/* Main Stylized Leaf Node Network - Simplified for small icon */}
                    <path
                        d="M50 10 
            C25 10, 10 30, 20 60 
            C30 90, 70 90, 80 60
            C90 30, 75 10, 50 10 Z"
                        fill="url(#leafGradient)"
                    />
                    {/* Veins / Network Lines */}
                    <path
                        d="M20 60 C30 50, 40 40, 50 10" // Main vein up
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    <circle cx="20" cy="60" r="5" fill="white" />
                    <circle cx="50" cy="10" r="5" fill="white" />
                    <circle cx="80" cy="60" r="5" fill="white" />
                </svg>
            </div>
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported icons size metadata
            // config to also set the ImageResponse's width and height.
            ...size,
        }
    )
}
