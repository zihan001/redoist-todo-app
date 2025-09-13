import { Schema, model, Types } from "mongoose";
const projectSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: "User", index: true, required: true },
  name: { type: String, required: true },
  color: { type: String, default: "#64748b" },
  archived: { type: Boolean, default: false },
}, { timestamps: true });
export default model("Project", projectSchema);
