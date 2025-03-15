import mongoose, { Connection } from "mongoose";

interface UserSchema {
  matricNumber: string;
  email: string;
  password: string;
  role: "user" | "admin" | "super-admin";
}

const userSchema = new mongoose.Schema<UserSchema>(
  {
    matricNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "super-admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User =
  mongoose.models.User || mongoose.model<UserSchema>("User", userSchema);

/* eslint-disable no-var */
declare global {
  var mongooseConnection: Connection | undefined;
}
/* eslint-enable no-var */
export async function connectdb() {
  const cached = globalThis.mongooseConnection;

  if (cached && cached.readyState === 1) {
    console.log("Using existing database connection.");
    return cached.db;
  }

  const MONGODB_URI = process.env.MONGO_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGO_URI is not defined in environment variables.");
  }

  try {
    console.log("Connecting to MongoDB...");
    const connection = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 10000,
    } as mongoose.ConnectOptions);

    console.log("Successfully connected to the database.");
    global.mongooseConnection = connection.connection;
    return connection.connection.db;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}


export { User };
export default User;
