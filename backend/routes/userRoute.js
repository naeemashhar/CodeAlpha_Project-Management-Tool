const express = require("express");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  updatePassword,
} = require("../controller/userController");
const { authMiddleware } = require("../middleware/auth");


const userRouter = express.Router();

//creating routes

//public
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

//private
userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.put("/profile",authMiddleware, updateProfile);
userRouter.put("/password",authMiddleware, updatePassword);

module.exports= userRouter;
