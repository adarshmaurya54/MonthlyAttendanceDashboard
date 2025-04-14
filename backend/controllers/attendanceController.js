const Attendance = require("../models/attendance");
const Student = require("../models/student");

const mongoose = require("mongoose");

exports.markAttendance = async (req, res) => {
  const { date, records } = req.body;
  try {
    for (const record of records) {
      const { enrollment, present } = record;

      const student = await Student.findOne({ enrollment });
      if (!student) continue;

      const status = present ? "Present" : "Absent";

      // Check if already marked
      const existing = await Attendance.findOne({
        student: student._id,
        date: new Date(date),
      });

      if (existing) {
        // Update status
        existing.status = status;
        await existing.save();
      } else {
        // Create new entry
        await Attendance.create({
          student: student._id,
          date: new Date(date),
          status,
        });
      }
    }

    return res.status(200).json({ message: "Attendance saved successfully." });
  } catch (err) {
    console.error("Error marking attendance:", err.message);
    return res
      .status(500)
      .json({ error: "Server error while marking attendance." });
  }
};

exports.getTodayAttendance = async (req, res) => {
  const { date } = req.query; // YYYY-MM-DD
  console.log(req.query);

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  try {
    const records = await Attendance.find({ date: new Date(date) }).populate(
      "student",
      "enrollment name"
    );

    if (!records || records.length === 0) {
      return res
        .status(404)
        .json({ message: "No attendance found for this date." });
    }

    res.status(200).json({ records });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getMonthlyAttendanceStats = async (req, res) => {
  try {
    const today = new Date(); // e.g. 2025-04-12
    const year = today.getFullYear();
    const month = today.getMonth(); // April = 3 (0-indexed)
    const startOfMonth = new Date(year, month, 1);

    // Step 1: Generate all working days from 1st to today (excluding Sundays)
    const workingDates = [];
    for (
      let d = new Date(startOfMonth);
      d <= today;
      d.setDate(d.getDate() + 1)
    ) {
      if (d.getDay() !== 0) {
        // 0 = Sunday
        workingDates.push(new Date(d));
      }
    }
    const totalWorkingDays = workingDates.length;

    // Step 2: Get all "Present" records from Attendance in the range
    const presentData = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: today },
          status: "Present",
        },
      },
      {
        $group: {
          _id: "$student",
          totalPresent: { $sum: 1 },
        },
      },
    ]);

    // Step 3: Get all students
    const allStudents = await Student.find({}, { name: 1, enrollment: 1 }).sort(
      { enrollment: 1 }
    );

    // Step 4: Merge data
    const summary = allStudents.map((student) => {
      const record = presentData.find(
        (r) => r._id.toString() === student._id.toString()
      );
      const totalPresent = record ? record.totalPresent : 0;
      const totalAbsent = totalWorkingDays - totalPresent;

      return {
        studentId: student._id,
        name: student.name,
        enrollment: student.enrollment,
        totalPresent,
        totalAbsent,
      };
    });

    res.status(200).json({ totalWorkingDays, summary });
  } catch (err) {
    console.error("Error fetching monthly stats:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAttendenceOfTheStudent = async (req, res) => {
  try {
    const { enrollment } = req.params;

    if (!enrollment) {
      return res.status(400).json({ error: "Enrollment number is required" });
    }

    const student = await Student.findOne({ enrollment });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based
    const today = now.getDate(); // current day of month

    const startOfMonth = new Date(year, month, 1);
    const endOfToday = new Date(year, month, today, 23, 59, 59); // limit till today

    // Get present records from DB
    const presentRecords = await Attendance.find({
      student: student._id,
      date: { $gte: startOfMonth, $lte: endOfToday },
    }).select("date status");

    // Convert to Map for quick lookup
    const presentMap = new Map();
    presentRecords.forEach((record) => {
      const day = new Date(record.date).getDate();
      presentMap.set(day, "Present");
    });

    // Build attendance records only till today
    const records = [];
    for (let day = 1; day <= today; day++) {
      const dateObj = new Date(year, month, day);
      const dayOfWeek = dateObj.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

      // Determine the status
      let status = "";
      if (dayOfWeek === 0) {
        status = ""; // For Sundays
      } else if (presentMap.has(day)) {
        status = "Present";
      } else {
        status = "Absent";
      }

      records.push({
        date: dateObj,
        status: status,
      });
    }

    res.status(200).json({
      enrollment: student.enrollment,
      name: student.name,
      month: `${year}-${(month + 1).toString().padStart(2, "0")}`,
      records,
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
