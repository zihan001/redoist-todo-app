import { Schema, model, Types } from "mongoose";
const taskSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: "User", index: true, required: true },
  project_id: { type: Types.ObjectId, ref: "Project", index: true },
  title: { type: String, required: true, index: true },
  description: String,
  priority: { type: String, enum: ["low","normal","high"], default: "normal" },
  due_date: Date,
  completed_at: Date,
}, { timestamps: true });

taskSchema.index({ user_id: 1, project_id: 1, due_date: 1, completed_at: 1 });

export default model("Task", taskSchema);
