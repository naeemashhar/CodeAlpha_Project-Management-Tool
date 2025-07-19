const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

async function authMiddleware(req, res, next) {
  //grabing the token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized, token missing !" });
  }

  const token = authHeader.split(" ")[1];

  //varify and attach user
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User Not Found !" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Token invalid or expired !",
      success: false,
      error: true,
    });
  }
}

module.exports = {
  authMiddleware,
};
