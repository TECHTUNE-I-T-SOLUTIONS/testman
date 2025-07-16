import { Schema, model, models } from "mongoose";

const LevelSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  { timestamps: true }
);

const Level = models.Level || model("Level", LevelSchema);
export default Level;
