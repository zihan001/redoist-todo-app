// server/src/models/Project.ts
import { Schema, model, Types } from "mongoose";

// Define the schema for the Project model
const ProjectSchema = new Schema({
  // Reference to the user who owns the project (required)
  userId: { type: Types.ObjectId, ref: "User", index: true, required: true },

  // Name of the project (required)
  name: { type: String, required: true },

  // Color associated with the project (optional, defaults to a shade of gray)
  color: { type: String, default: "#64748b" },

  // Whether the project is archived (optional, defaults to false)
  archived: { type: Boolean, default: false },
}, { 
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true 
});

export default model("Project", ProjectSchema);
