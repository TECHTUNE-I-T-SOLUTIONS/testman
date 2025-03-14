import mongoose from "mongoose";

const MONGODB_URI = String(process.env.MONGODB_URI);

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env.local");
}

/* eslint-disable no-var */
declare global {
  var mongooseConnection: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// Use a global cache to prevent multiple connections in development
let cached = global.mongooseConnection || { conn: null, promise: null };

async function connectdb(): Promise<mongoose.Connection> {
  if (cached.conn) {
    console.log("🔄 Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("⏳ Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI, {}).then((mongoose) => {
      console.log("✅ MongoDB Connected Successfully!");
      return mongoose.connection;
    });
  }

  cached.conn = await cached.promise;
  global.mongooseConnection = cached; 

  return cached.conn;
}

export default connectdb;