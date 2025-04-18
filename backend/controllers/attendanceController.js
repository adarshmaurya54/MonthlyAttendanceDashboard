const Attendance = require("../models/attendance");
const Student = require("../models/student");
const moment = require("moment");
const ExcelJS = require("exceljs");

exports.exportMonthlyAttendanceExcel = async (req, res) => {
  try {
    const { monthParam } = req.query; // e.g., "2025-04"
    const [year, month] = monthParam.split("-").map(Number);

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const today = new Date();
    const endDate =
      today.getMonth() === month - 1 && today.getFullYear() === year
        ? today
        : endOfMonth;

    // Generate working days (including Sundays for label purposes)
    const workingDates = [];
    for (
      let d = new Date(startOfMonth);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      workingDates.push(new Date(d));
    }

    const presentRecords = await Attendance.find({
      date: { $gte: startOfMonth, $lte: endDate },
      status: "Present",
    });

    // Map: { enrollment => Set of present date strings }
    const presentMap = {};
    presentRecords.forEach((record) => {
      const dateStr = moment(record.date).format("YYYY-MM-DD");
      if (!presentMap[record.enrollment]) {
        presentMap[record.enrollment] = new Set();
      }
      presentMap[record.enrollment].add(dateStr);
    });

    const allStudents = await Student.find({}, { name: 1, enrollment: 1 }).sort(
      { enrollment: 1 }
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Attendance");

    // Build header row
    const headerRow = ["Enrollment", "Name"];
    workingDates.forEach((date) => {
      headerRow.push(moment(date).format("DD-MM"));
    });
    headerRow.push("Total Present", "Total Absent", "Avg Attendance (%)");
    sheet.addRow(headerRow);

    // Fill data rows
    allStudents.forEach((student) => {
      const row = {
        enrollment: student.enrollment,
        name: student.name,
      };

      let totalP = 0;

      workingDates.forEach((date, idx) => {
        const dayOfWeek = date.getDay(); // 0 = Sunday
        const dateStr = moment(date).format("YYYY-MM-DD");

        if (dayOfWeek === 0) {
          row[`day${idx + 1}`] = "Sunday";
        } else {
          const isPresent = presentMap[student.enrollment]?.has(dateStr);
          const status = isPresent ? "P" : "A";
          row[`day${idx + 1}`] = status;
          if (status === "P") totalP++;
        }
      });

      const totalDays = workingDates.filter((d) => d.getDay() !== 0).length;
      const rowData = [row.enrollment, row.name];

      workingDates.forEach((_, idx) => {
        rowData.push(row[`day${idx + 1}`]);
      });

      rowData.push(totalP);
      rowData.push(totalDays - totalP);

      const avgAttendance =
        totalDays === 0 ? 0 : ((totalP / totalDays) * 100).toFixed(2);
      rowData.push(`${avgAttendance}%`);

      const addedRow = sheet.addRow(rowData);

      // Apply background colors for P (green) and A (red)
      workingDates.forEach((_, idx) => {
        const cell = addedRow.getCell(3 + idx); // Skip Enrollment & Name

        if (cell.value === "P") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "C6EFCE" }, // light green
          };
        } else if (cell.value === "A") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFC7CE" }, // light red
          };
        }
        // No fill for "Sunday"
      });
    });

    // Set response headers
    const fileName = `Attendance-${monthParam}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exporting Excel:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.markAttendance = async (req, res) => {
  const { date, records } = req.body;
  try {
    for (const record of records) {
      const { enrollment, name, present } = record;

      const student = await Student.findOne({ enrollment });
      if (!student) continue;

      const status = present ? "Present" : "Absent";

      // Check if already marked
      const existing = await Attendance.findOne({
        enrollment,
        date: new Date(date),
      });

      if (existing) {
        // Update status
        existing.status = status;
        await existing.save();
      } else {
        // Create new entry
        await Attendance.create({
          enrollment,
          name,
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
    const records = await Attendance.find({ date: new Date(date) });

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
    const { monthParam } = req.params; // e.g., "2025-04"
    const [year, month] = monthParam.split("-").map(Number);

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const today = new Date();
    const endDate =
      today.getMonth() === month - 1 && today.getFullYear() === year
        ? today
        : endOfMonth;

    // Generate working days (excluding Sundays)
    const workingDates = [];
    for (
      let d = new Date(startOfMonth);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      if (d.getDay() !== 0) {
        workingDates.push(new Date(d));
      }
    }
    const totalWorkingDays = workingDates.length;

    // Get all "Present" attendance records within the date range
    const presentData = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endDate },
          status: "Present",
        },
      },
      {
        $group: {
          _id: "$enrollment", // group by enrollment (not student._id)
          totalPresent: { $sum: 1 },
        },
      },
    ]);

    // Get all students
    const allStudents = await Student.find({}, { name: 1, enrollment: 1 }).sort(
      { enrollment: 1 }
    );

    // Merge attendance data with student list
    const summary = allStudents.map((student) => {
      const record = presentData.find((r) => r._id === student.enrollment);
      const totalPresent = record ? record.totalPresent : 0;
      const totalAbsent = totalWorkingDays - totalPresent;

      return {
        enrollment: student.enrollment,
        name: student.name,
        totalPresent,
        totalAbsent,
      };
    });

    const monthName = moment()
      .month(month - 1)
      .format("MMMM");

    res.status(200).json({ monthName, totalWorkingDays, summary });
  } catch (err) {
    console.error("Error fetching monthly stats:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAttendenceOfTheStudent = async (req, res) => {
  console.log("hii-1");
  try {
    const { enrollment, monthParam } = req.params;

    if (!enrollment) {
      return res.status(400).json({ error: "Enrollment number is required" });
    }

    if (!monthParam) {
      return res
        .status(400)
        .json({ error: "Month is required in the format YYYY-MM" });
    }

    // Parse and validate the monthParam
    const [year, month] = monthParam.split("-").map(Number);
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid month format" });
    }

    const student = await Student.findOne({ enrollment });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const now = new Date();
    const isCurrentMonth =
      now.getFullYear() === year && now.getMonth() + 1 === month;

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfRange = isCurrentMonth
      ? new Date(year, month - 1, now.getDate(), 23, 59, 59) // current day end
      : new Date(year, month, 0, 23, 59, 59); // last day of that month

    const presentRecords = await Attendance.find({
      enrollment: student.enrollment,
      date: { $gte: startOfMonth, $lte: endOfRange },
    }).select("date status");

    const presentMap = new Map();
    presentRecords.forEach((record) => {
      const day = new Date(record.date).getDate();
      presentMap.set(day, "Present");
    });

    const daysInRange = isCurrentMonth
      ? now.getDate()
      : new Date(year, month, 0).getDate();

    const records = [];
    for (let day = 1; day <= daysInRange; day++) {
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay();

      let status = "";
      if (dayOfWeek === 0) {
        status = ""; // Sunday
      } else if (presentMap.has(day)) {
        status = "Present";
      } else {
        status = "Absent";
      }

      records.push({
        date: dateObj,
        status,
      });
    }

    res.status(200).json({
      enrollment: student.enrollment,
      name: student.name,
      month: monthParam,
      records,
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
