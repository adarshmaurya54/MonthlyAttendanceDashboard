const express = require("express");
const attendanceController = require("../controllers/attendanceController");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

router.get("/export-attendance",verifyToken, attendanceController.exportAttendance);

router.post("/mark",verifyToken, attendanceController.markAttendance)
router.get("/today",verifyToken, attendanceController.getTodayAttendance)
router.get("/month-summary/:monthParam", attendanceController.getMonthlyAttendanceStats);
router.get("/:enrollment/:monthParam", attendanceController.getAttendenceOfTheStudent);


module.exports = router;