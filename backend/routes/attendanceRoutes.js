const express = require("express");
const attendanceController = require("../controllers/attendanceController");
const router = express.Router();

router.get("/export-excel", attendanceController.exportMonthlyAttendanceExcel);

router.post("/mark", attendanceController.markAttendance)
router.get("/today", attendanceController.getTodayAttendance)
router.get("/month-summary/:monthParam", attendanceController.getMonthlyAttendanceStats);
router.get("/:enrollment/:monthParam", attendanceController.getAttendenceOfTheStudent);


module.exports = router;