export interface RateLimitOptions {
    windowMs: number;
    maxRequests: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(ip: string, options: RateLimitOptions = { windowMs: 60000, maxRequests: 30 }) {
    const now = Date.now();

    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + options.windowMs });
        return { success: true };
    }

    const record = rateLimitStore.get(ip)!;

    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + options.windowMs;
        return { success: true };
    }

    record.count++;

    if (record.count > options.maxRequests) {
        return { success: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
    }

    return { success: true };
}
