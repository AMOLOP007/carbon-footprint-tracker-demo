// Legacy JWT module — hardened to prevent use with a default secret.
// This module exists only for backwards compatibility.
// All new authentication should use lib/auth/getUserId.ts via NextAuth sessions.

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.warn("[SECURITY] JWT_SECRET is not set. Legacy JWT operations will fail.");
}

export function signToken(payload: any) {
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is required");
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string) {
    if (!JWT_SECRET) {
        return null;
    }
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}
export const verifyJWT = verifyToken;
