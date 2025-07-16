import mongoose, { Schema, Document } from "mongoose";

export interface IFaculty extends Document {
  name: string;
  session: string;
}

const FacultySchema = new Schema<IFaculty>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    session: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Faculty ||
  mongoose.model<IFaculty>("Faculty", FacultySchema);
