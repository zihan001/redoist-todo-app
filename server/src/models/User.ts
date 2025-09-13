import { Schema, model } from "mongoose";
const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
}, { timestamps: true });
export default model("User", userSchema);
