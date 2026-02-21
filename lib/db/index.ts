import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    // Warn but don't crash in dev if just building UI
    console.warn("Please define the MONGODB_URI environment variable inside .env.local");
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Global augmentation for TypeScript
declare global {
    var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDB = async (retries = 3, delay = 1000): Promise<typeof mongoose> => {
    if (cached.conn) {
        // Return existing connection if ready
        if (cached.conn.connection.readyState === 1) {
            return cached.conn;
        }
    }

    if (!MONGODB_URI) {
        throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
        };

        const maskedURI = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
        console.log(`[DB] Attempting connection to: ${maskedURI}`);

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log("✅ MongoDB connected");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;

        // Wait for connection to be fully ready
        if (cached.conn.connection.readyState !== 1) {
            // Give it a moment to establish
            await new Promise(resolve => setTimeout(resolve, 100));
        }

    } catch (e) {
        cached.promise = null;
        if (retries > 0) {
            console.warn(`MongoDB connection failed. Retrying in ${delay}ms... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return connectToDB(retries - 1, delay * 2);
        }
        throw e;
    }

    if (!cached.conn) {
        throw new Error("Failed to establish database connection");
    }

    return cached.conn;
};

export default connectToDB;
