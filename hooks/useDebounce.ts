import { useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing function calls
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds (default: 500)
 */
export function useDebounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number = 500
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                func(...args);
            }, delay);
        },
        [func, delay]
    );
}
