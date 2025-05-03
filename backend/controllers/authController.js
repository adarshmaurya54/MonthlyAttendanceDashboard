const Teacher = require("../models/teacher");
const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
require("dotenv").config();

exports.signupForTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check if already exists
    const isExists = await Teacher.findOne({ email });
    if (isExists)
      return res.status(409).json({ message: "Teacher is already exists!" });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // creating new user
    const newTeacher = new Teacher({
      email,
      password: hashedPassword,
    });

    //save to database
    await newTeacher.save();

    // generating jwt taken

    const token = jwt.sign(
      { id: newTeacher._id, email: newTeacher.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.status(201).json({
      message: "Signup successful",
      teacher: {
        id: newTeacher._id,
        email: newTeacher.email,
      },
      token,
    });
  } catch (error) {
    console.log("Error : ", error);
    res.status(500).json({ error: "Somthing wrong!!" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, loginType } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (!existingTeacher) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingTeacher.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: existingTeacher._id, email: existingTeacher.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      teacher: {
        id: existingTeacher._id,
        email: existingTeacher.email,
      },
      token,
    });
  } catch (error) {
    console.log("Error : ", error);
    res.status(500).json({ error: "Somthing wrong!!" });
  }
};

exports.currentTeacherController = async (req, res) => {
  try {
    const userId_ = new mongoose.Types.ObjectId(req.userId)
    const user = await Teacher.findOne({ _id: userId_ });
    return res.status(200).send({
      success: true,
      message: "teacher fetched successfully...",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "unable to get current user",
      error,
    });
  }
};
