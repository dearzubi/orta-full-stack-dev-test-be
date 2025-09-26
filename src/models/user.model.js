import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordResetTokenHash: { type: String, required: false },
  passwordResetTokenExpiry: { type: Date, required: false },
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
