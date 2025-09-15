// server/src/models/User.ts
import { Schema, model } from "mongoose";

// Define the schema for the User model
const userSchema = new Schema({
  // User's email address (must be unique and is required)
  email: { type: String, unique: true, required: true },

  // Hashed password for authentication (required)
  password_hash: { type: String, required: true },
}, { 
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true 
});

export default model("User", userSchema);
