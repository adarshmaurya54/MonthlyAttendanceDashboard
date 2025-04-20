const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middlewares/verifyToken");

router.post("/login", authController.login);
router.post("/signup", authController.signupForTeacher);
router.get("/current-user",verifyToken, authController.currentTeacherController);
module.exports = router