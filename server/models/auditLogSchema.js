const mongoose = require("mongoose")

const auditLogSchema = new mongoose.Schema({
  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attendance",
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  changeDate: {
    type: Date,
    default: Date.now
  },
  action: {
    type: String,
    enum: ["marked", "rectified"],
    required: true
  },
  oldStatus: { type: String },
  newStatus: { type: String },
})

module.exports = mongoose.model("AuditLog", auditLogSchema)

