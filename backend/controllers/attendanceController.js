const Attendance = require("../models/attendance");
const Student = require("../models/student");
const moment = require("moment");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const exportMonthlyAttendanceToExcel = async (res, monthParam) => {
  const [year, month] = monthParam.split("-").map(Number);

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const today = new Date();
  const endDate =
    today.getMonth() === month - 1 && today.getFullYear() === year
      ? today
      : endOfMonth;

  // Generate working days
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

  const presentMap = {};
  presentRecords.forEach((record) => {
    const dateStr = moment(record.date).format("YYYY-MM-DD");
    if (!presentMap[record.enrollment]) {
      presentMap[record.enrollment] = new Set();
    }
    presentMap[record.enrollment].add(dateStr);
  });

  const allStudents = await Student.find({}, { name: 1, enrollment: 1 }).sort({
    enrollment: 1,
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance");

  const headerRow = ["Enrollment", "Name"];
  workingDates.forEach((date) => {
    headerRow.push(moment(date).format("DD-MM"));
  });
  headerRow.push("Total Present", "Total Absent", "Avg Attendance (%)");
  sheet.addRow(headerRow);

  allStudents.forEach((student) => {
    const row = {
      enrollment: student.enrollment,
      name: student.name,
    };

    let totalP = 0;
    workingDates.forEach((date, idx) => {
      const dayOfWeek = date.getDay();
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

    workingDates.forEach((_, idx) => {
      const cell = addedRow.getCell(3 + idx); // offset for Enrollment + Name
      if (cell.value === "P") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "C6EFCE" },
        };
      } else if (cell.value === "A") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFC7CE" },
        };
      }
    });
  });

  const fileName = `Attendance-${monthParam}.xlsx`;
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

  await workbook.xlsx.write(res);
  res.end();
};

// exprint attendance as pdf logic
const exportMonthlyAttendanceToPDF = async (res, monthParam) => {
  const [year, month] = monthParam.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  const today = new Date();
  const endDate =
    today.getMonth() === month - 1 && today.getFullYear() === year
      ? today
      : endOfMonth;

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

  const presentMap = {};
  presentRecords.forEach((record) => {
    const dateStr = moment(record.date).format("YYYY-MM-DD");
    if (!presentMap[record.enrollment]) {
      presentMap[record.enrollment] = new Set();
    }
    presentMap[record.enrollment].add(dateStr);
  });

  const allStudents = await Student.find({}, { name: 1, enrollment: 1 }).sort({
    enrollment: 1,
  });

  // PDF setup
  const doc = new PDFDocument({ layout: "landscape", margin: 10 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Attendance-${monthParam}.pdf`
  );
  doc.pipe(res);

  const fontSize = 6.5; // reduced to fit more data
  const cellHeight = 10;
  const colPadding = 1;

  const fixedColWidths = {
    enrollment: 55,
    name: 80,
    status: 18, // reduced width for status columns
  };

  const pageWidth = doc.page.width - 20; // account for 10+10 margin
  const maxStatusCols = Math.floor(
    (pageWidth -
      fixedColWidths.enrollment -
      fixedColWidths.name -
      3 * fixedColWidths.status) /
      fixedColWidths.status
  );

  // Split dates into manageable column chunks
  const dateChunks = [];
  for (let i = 0; i < workingDates.length; i += maxStatusCols) {
    dateChunks.push(workingDates.slice(i, i + maxStatusCols));
  }

  const drawCell = (x, y, text, width, bgColor = null) => {
    if (bgColor) {
      doc.rect(x, y, width, cellHeight).fill(bgColor).fillColor("black");
    }
    doc.rect(x, y, width, cellHeight).stroke();
    doc
      .font("Times-Roman")
      .fontSize(fontSize)
      .fillColor("black")
      .text(String(text), x + colPadding, y + 1.5, {
        width: width - 2 * colPadding,
        align: "center",
        ellipsis: true,
        lineBreak: false,
      });
  };

  // Only add page explicitly for 2nd+ chunks
  let isFirstChunk = true;

  const drawPageHeader = (doc, monthParam) => {
    // Header Title
    doc
      .font("Times-Bold")
      .fontSize(16)
      .text("Institute of Information Technology & Management, New Delhi", {
        align: "center",
        underline: true,
      });

    const formattedMonth = moment(monthParam, "YYYY-MM").format("MMMM YYYY");

    // Subtitle
    doc
      .font("Times-Roman")
      .fontSize(11)
      .text(
        `Monthly Attendance Sheet for MCA - II Semester (${formattedMonth})`,
        {
          align: "center",
        }
      );

    doc.moveDown(0.5);
  };

  for (const chunk of dateChunks) {
    if (!isFirstChunk) {
      doc.addPage({ layout: "landscape", margin: 10 });
    }
    isFirstChunk = false;

    // // Header
    // doc
    //   .font("Times-Bold") // Bold font for institute name
    //   .fontSize(16)
    //   .text("Institute of Information Technology & Management, New Delhi", {
    //     align: "center",
    //     underline: true,
    //   });

    // // Format the month (e.g., "April 2025")
    // const formattedMonth = moment(monthParam, "YYYY-MM").format("MMMM YYYY");

    // doc
    //   .font("Times-Roman") // Regular font for subtitle
    //   .fontSize(11)
    //   .text(
    //     `Monthly Attendance Sheet for MCA - II Semester (${formattedMonth})`,
    //     {
    //       align: "center",
    //       underline: false,
    //     }
    //   );

    // doc.moveDown(0.5);
    drawPageHeader(doc, monthParam);

    let x = doc.page.margins.left;
    let y = 50;

    // Header
    drawCell(x, y, "Enrollment", fixedColWidths.enrollment, "#e0e0e0");
    x += fixedColWidths.enrollment;
    drawCell(x, y, "Name", fixedColWidths.name, "#e0e0e0");
    x += fixedColWidths.name;

    for (const date of chunk) {
      drawCell(
        x,
        y,
        moment(date).format("DD-MM"),
        fixedColWidths.status,
        "#e0e0e0"
      );
      x += fixedColWidths.status;
    }

    drawCell(x, y, "P", fixedColWidths.status, "#e0e0e0");
    x += fixedColWidths.status;
    drawCell(x, y, "A", fixedColWidths.status, "#e0e0e0");
    x += fixedColWidths.status;
    drawCell(x, y, "%", fixedColWidths.status, "#e0e0e0");

    y += cellHeight;

    for (const student of allStudents) {
      x = doc.page.margins.left;

      drawCell(x, y, String(student.enrollment), fixedColWidths.enrollment);
      x += fixedColWidths.enrollment;

      drawCell(x, y, student.name, fixedColWidths.name);
      x += fixedColWidths.name;

      let totalP = 0;
      let totalDays = 0;

      for (const date of chunk) {
        const day = date.getDay();
        const dateStr = moment(date).format("YYYY-MM-DD");
        let text = "Sun",
          bg = "#DDDDDD";

        if (day !== 0) {
          totalDays++;
          const isPresent = presentMap[student.enrollment]?.has(dateStr);
          text = isPresent ? "P" : "A";
          bg = isPresent ? "#C6EFCE" : "#FFC7CE";
          if (isPresent) totalP++;
        }

        drawCell(x, y, text, fixedColWidths.status, bg);
        x += fixedColWidths.status;
      }

      const totalA = totalDays - totalP;
      const percent = totalDays ? ((totalP / totalDays) * 100).toFixed(0) : "0";

      drawCell(x, y, totalP, fixedColWidths.status);
      x += fixedColWidths.status;
      drawCell(x, y, totalA, fixedColWidths.status);
      x += fixedColWidths.status;
      drawCell(x, y, `${percent}%`, fixedColWidths.status);

      y += cellHeight;

      if (y > doc.page.height - 40) {
        doc.addPage({ layout: "landscape", margin: 10 });
        drawPageHeader(doc, monthParam); // add header again
        y = 50;
      }
    }
  }

  doc.end();
};

const exportMonthlyAttendanceToCSV = async (res, monthParam) => {
  const [year, month] = monthParam.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  const today = new Date();
  const endDate =
    today.getMonth() === month - 1 && today.getFullYear() === year
      ? today
      : endOfMonth;

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

  const presentMap = {};
  presentRecords.forEach((record) => {
    const dateStr = record.date.toISOString().split("T")[0];
    if (!presentMap[record.enrollment]) {
      presentMap[record.enrollment] = new Set();
    }
    presentMap[record.enrollment].add(dateStr);
  });

  const allStudents = await Student.find({}, { name: 1, enrollment: 1 }).sort({
    enrollment: 1,
  });

  // CSV headers
  const headers = ["Enrollment", "Name", ...workingDates.map(d => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}`;
  }), "P", "A", "%"];

  const csvRows = [headers.join(",")];

  for (const student of allStudents) {
    const row = [];
    row.push(student.enrollment);
    row.push(`"${student.name}"`);

    let totalP = 0;
    let totalDays = 0;

    for (const date of workingDates) {
      const dateStr = date.toISOString().split("T")[0];
      const isPresent = presentMap[student.enrollment]?.has(dateStr);
      if (date.getDay() === 0) {
        row.push("Sun");
      } else {
        totalDays++;
        if (isPresent) {
          row.push("P");
          totalP++;
        } else {
          row.push("A");
        }
      }
    }

    const totalA = totalDays - totalP;
    const percentage = totalDays === 0 ? "0%" : ((totalP / totalDays) * 100).toFixed(1) + "%";

    row.push(totalP);
    row.push(totalA);
    row.push(percentage);

    csvRows.push(row.join(","));
  }

  const csvContent = csvRows.join("\n");

  // Set headers
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=Attendance-${monthParam}.csv`);

  res.send(csvContent);
};

const exportMonthlyAttendanceToJSON = async (res, monthParam) => {
  const [year, month] = monthParam.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  const today = new Date();
  const endDate =
    today.getMonth() === month - 1 && today.getFullYear() === year
      ? today
      : endOfMonth;

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

  const presentMap = {};
  presentRecords.forEach((record) => {
    const dateStr = record.date.toISOString().split("T")[0];
    if (!presentMap[record.enrollment]) {
      presentMap[record.enrollment] = new Set();
    }
    presentMap[record.enrollment].add(dateStr);
  });

  const allStudents = await Student.find({}, { name: 1, enrollment: 1 }).sort({
    enrollment: 1,
  });

  const attendanceData = [];

  for (const student of allStudents) {
    const studentAttendance = {
      enrollment: student.enrollment,
      name: student.name,
      attendance: [],
      totalPresent: 0,
      totalAbsent: 0,
      attendancePercentage: "0%",
    };

    let totalP = 0;
    let totalDays = 0;

    for (const date of workingDates) {
      const dateStr = date.toISOString().split("T")[0];
      const isPresent = presentMap[student.enrollment]?.has(dateStr);

      if (date.getDay() !== 0) {  // Skip Sundays
        totalDays++;
        if (isPresent) {
          studentAttendance.attendance.push({ date: dateStr, status: "P" });
          totalP++;
        } else {
          studentAttendance.attendance.push({ date: dateStr, status: "A" });
        }
      }
    }

    const totalA = totalDays - totalP;
    studentAttendance.totalPresent = totalP;
    studentAttendance.totalAbsent = totalA;
    studentAttendance.attendancePercentage =
      totalDays === 0 ? "0%" : ((totalP / totalDays) * 100).toFixed(1) + "%";

    attendanceData.push(studentAttendance);
  }

  // Send JSON response
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename=Attendance-${monthParam}.json`);
  res.send(JSON.stringify(attendanceData, null, 2));
};


exports.exportAttendance = async (req, res) => {
  try {
    const { monthParam, format } = req.query;

    if (!monthParam || !format) {
      return res.status(400).json({ error: "Missing monthParam or format" });
    }

    switch (format.toLowerCase()) {
      case "excel":
        await exportMonthlyAttendanceToExcel(res, monthParam);
        break;
      case "pdf":
        await exportMonthlyAttendanceToPDF(res, monthParam);
        break;
      case "csv":
        await exportMonthlyAttendanceToCSV(res, monthParam);
        break;
      case "json":
        await exportMonthlyAttendanceToJSON(res, monthParam);
        break;
      default:
        res.status(400).json({ error: "Unsupported export format" });
    }
  } catch (err) {
    console.error("Export error:", err);
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
