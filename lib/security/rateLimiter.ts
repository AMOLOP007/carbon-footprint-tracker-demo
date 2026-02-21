export interface RateLimitOptions {
    windowMs: number;
    maxRequests: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimiter(ip: string, options: RateLimitOptions = { windowMs: 60000, maxRequests: 30 }) {
    // Optional Redis Upstash REST Fallback (Lazy loaded via env)
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (process.env.NODE_ENV === "production" && redisUrl && redisToken) {
        try {
            const url = redisUrl.endsWith('/') ? redisUrl.slice(0, -1) : redisUrl;
            const key = `ratelimit:${ip}:${Math.floor(Date.now() / options.windowMs)}`;

            // Lightweight fetch without adding heavy @upstash dependencies
            const res = await fetch(`${url}/pipeline`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${redisToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([
                    ["INCR", key],
                    ["PEXPIRE", key, options.windowMs]
                ]),
                // Keep the fetch very fast, don't let it hang the API
                signal: AbortSignal.timeout(800)
            });

            if (res.ok) {
                const data = await res.json();
                const count = data[0].result;

                if (count > options.maxRequests) {
                    return { success: false, retryAfter: Math.ceil(options.windowMs / 1000) };
                }
                return { success: true };
            }
        } catch (e) {
            // Silently fall back to memory limiter if Redis fails or times out
            console.warn("[SECURITY] Redis rate limit fetch failed, falling back to memory.", e);
        }
    }

    // --- In-Memory Fallback Path ---
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
