// src/models/Task.ts
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const TaskSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true, required: true },
  title: { type: String, required: true, trim: true },
  notes: { type: String, default: "" },
  dueDate: { type: Date, default: null },
  priority: { type: Number, enum: [1,2,3], default: 2, index: true },
  completedAt: { type: Date, default: null, index: true },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
}, { minimize: false });

TaskSchema.index({ userId: 1, completedAt: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, priority: -1, dueDate: 1 });

TaskSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

export type TaskDoc = InferSchemaType<typeof TaskSchema>;
export const Task = mongoose.model<TaskDoc>("Task", TaskSchema);
