const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// Connect to MongoDB
connectDB();
// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for froms

//routes
app.use("/students", require('./routes/studentsRoutes'))
app.use("/attendance", require('./routes/attendanceRoutes'))

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Error occurred:", err.message);
  res
    .status(err.status || 500)
    .send({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
