import { Schema, model, Types } from "mongoose";
const ProjectSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", index: true, required: true },
  name: { type: String, required: true },
  color: { type: String, default: "#64748b" },
  archived: { type: Boolean, default: false },
}, { timestamps: true });
export default model("Project", ProjectSchema);
