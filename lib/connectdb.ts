import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined in environment variables.");
}

/* Extend globalThis to store the cached connection */
interface MongooseGlobal {
  mongooseConnection?: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

const globalWithMongoose = globalThis as MongooseGlobal;

if (!globalWithMongoose.mongooseConnection) {
  globalWithMongoose.mongooseConnection = { conn: null, promise: null };
}

const cached = globalWithMongoose.mongooseConnection;

export async function connectdb(): Promise<mongoose.Connection> {
  if (cached.conn) {
    console.log("🔄 Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("⏳ Connecting to MongoDB...");
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000, // Wait max 5s before failing
        socketTimeoutMS: 45000, // Close socket if inactive for 45s
        connectTimeoutMS: 5000, // 5s timeout for initial connection
      })
      .then((mongoose) => {
        console.log("✅ MongoDB Connected Successfully!");
        return mongoose.connection;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1); // Stop the server if DB connection fails
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
