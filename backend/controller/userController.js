const User = require("../model/userModel");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const TOKEN_EXPIRE = "24h";

const createToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRE });

//register
async function registerUser(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields required !",
      success: false,
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      message: "Invalid Email !",
      success: false,
    });
  }
  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must me atleast 8 characters !",
      success: false,
    });
  }

  try {
    if (await User.findOne({ email })) {
      return res.status(409).json({
        message: "User Already Exist !",
        success: false,
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashed });

    const token = createToken(user._id);

    res.status(201).json({
      message: "",
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something Went Wrong !",
      success: false,
      error: true,
    });
  }
}

//login function
async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and Password Required !", success: false });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid Credentials !", success: false });
    }

    const match = bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ message: "Invalid Credentials !", success: false });
    }

    const token = createToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something Went Wrong !",
      success: false,
      error: true,
    });
  }
}

//get current user
async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id).select("name email");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user not found !" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something Went Wrong !",
      success: false,
      error: true,
    });
  }
}

//update user-profile
async function updateProfile(req, res) {
  const { name, email } = req.body;

  if (!name || !email || !validator.isEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Valid Name and Email Required !" });
  }

  try {
    const exists = await User.findOne({ email, _id: { $ne: req.user.id } });

    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use !" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true, select: "name email" }
    );

    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something Went Wrong !",
      success: false,
      error: true,
    });
  }
}

//change Password
async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status.json({
      success: false,
      message: "Password is invalid OR too short !",
    });
  }

  try {
    const user = await User.findById(req.user.id).select("password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found !" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Current Password is incorrect !" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password Changed Successfully !", success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something Went Wrong !",
      success: false,
      error: true,
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  updatePassword,
};
