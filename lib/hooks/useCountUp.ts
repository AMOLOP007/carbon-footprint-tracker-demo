import { useEffect, useState } from 'react';

/**
 * Custom hook for animating numbers with count-up effect
 * @param end - The final number to count to
 * @param duration - Duration of animation in milliseconds (default: 2000)
 * @param decimals - Number of decimal places (default: 0)
 */
export function useCountUp(end: number, duration: number = 2000, decimals: number = 0) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = end * easeOutQuart;

            setCount(currentCount);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [end, duration]);

    return count.toFixed(decimals);
}
