// models/Student.js

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  enrollment: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("student", studentSchema);
