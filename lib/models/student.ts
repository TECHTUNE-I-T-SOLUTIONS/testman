import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  name: string;
  email: string;
  matricNumber: string;
  faculty: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  level: mongoose.Types.ObjectId;
  password: string;
  createdAt: Date;
  status: "Active" | "Inactive";
  loggedIn: "True" | "False";
  isActive: boolean;
  phoneNumber?: string; // ✅ added
  pushSubscription?: Record<string, unknown> | null; // ✅ added for push notifications
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    matricNumber: { type: String, required: true, unique: true },
    faculty: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    level: { type: Schema.Types.ObjectId, ref: "Level", required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String }, // ✅ added
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },
    loggedIn: {
      type: String,
      enum: ["True", "False"],
      default: "False",
    },
    isActive: {
      type: Boolean,
      default: false
    },
    pushSubscription: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


const Student =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;