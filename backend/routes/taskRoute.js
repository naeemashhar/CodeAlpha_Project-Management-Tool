const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const {
  getTask,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controller/taskController");

const taskRouter = express.Router();

taskRouter
  .route("/gp")
  .get(authMiddleware, getTask)
  .post(authMiddleware, createTask);

taskRouter
  .route("/:id/gp")
  .get(authMiddleware, getTaskById)
  .put(authMiddleware, updateTask)
  .delete(authMiddleware, deleteTask);


  module.exports = taskRouter;