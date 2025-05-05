import mongoose, { Schema, Document } from "mongoose";

interface IAdSettings extends Document {
  status: "on" | "off";
}

const AdSettingsSchema = new Schema<IAdSettings>(
  {
    status: {
      type: String,
      enum: ["on", "off"],
      default: "off",
    },
  },
  { timestamps: true }
);

export default mongoose.models.AdSettings ||
  mongoose.model<IAdSettings>("AdSettings", AdSettingsSchema);
