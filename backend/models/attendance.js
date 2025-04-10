// models/Attendance.js

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true,
  }
});

attendanceSchema.index({ student: 1, date: 1 }, { unique: true }); // prevent duplicate entries

module.exports = mongoose.model("Attendance", attendanceSchema);
