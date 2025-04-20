const JWT = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or malformed" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    if (req.body) {
      req.body.userId = decoded.id;
    }else{
      req.userId = decoded.id;
    }
    console.log(decoded);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: err,
    });
  }
};

module.exports = verifyToken;
