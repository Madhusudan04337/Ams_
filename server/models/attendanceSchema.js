const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    date: { 
      type: Date, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["present", "absent", "on_leave"], 
      default: "present" },
    rectifiedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" },   },
  { timestamps: true },
)

attendanceSchema.index({ user: 1, date: 1 }, { unique: true }) // Only one attendance per user per day
module.exports = mongoose.model("Attendance", attendanceSchema)
