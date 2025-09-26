// models/shiftsModel.js
import mongoose from "mongoose";
import "./userModel.js";
import "./locationModel.js";

const ShiftSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    role: { type: String, required: true },
    typeOfShift: [{ type: String }],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startTime: { type: String, required: true },
    finishTime: { type: String, required: true },
    numOfShiftsPerDay: { type: Number, default: 1 },

    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Shift", ShiftSchema);
