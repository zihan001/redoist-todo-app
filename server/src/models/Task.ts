// server/src/models/Task.ts
import mongoose, { Schema, type InferSchemaType } from "mongoose";

// Define the schema for the Task model
const TaskSchema = new Schema({
  // Reference to the user who owns the task (required)
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },

  // Reference to the project the task belongs to (required)
  projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true, required: true },

  // Title of the task (required, trimmed)
  title: { type: String, required: true, trim: true },

  // Additional notes for the task (optional, defaults to empty string)
  notes: { type: String, default: "" },

  // Due date for the task (optional, defaults to null)
  dueDate: { type: Date, default: null },

  // Priority of the task (1=Low, 2=Medium, 3=High; defaults to Medium)
  priority: { type: Number, enum: [1,2,3], default: 2, index: true },

  // Timestamp for when the task was completed (optional, defaults to null)
  completedAt: { type: Date, default: null, index: true },

  // Timestamp for when the task was created (defaults to the current date)
  createdAt: { type: Date, default: () => new Date() },

  // Timestamp for when the task was last updated (defaults to the current date)
  updatedAt: { type: Date, default: () => new Date() },
}, { 
  // Do not minimize empty objects in the schema
  minimize: false 
});

// Indexes for efficient querying
TaskSchema.index({ userId: 1, completedAt: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, priority: -1, dueDate: 1 });

// Middleware to update the updatedAt field before saving
TaskSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

// Infer the TypeScript type for the Task document
export type TaskDoc = InferSchemaType<typeof TaskSchema>;

export const Task = mongoose.model<TaskDoc>("Task", TaskSchema);
