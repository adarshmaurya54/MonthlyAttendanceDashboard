const express = require("express");
const attendanceController = require("../controllers/attendanceController");
const router = express.Router();

router.post("/mark", attendanceController.markAttendance)
router.get("/today", attendanceController.getTodayAttendance)
router.get("/month-summary", attendanceController.getMonthlyAttendanceStats);
router.get("/:enrollment", attendanceController.getAttendenceOfTheStudent);

module.exports = router;