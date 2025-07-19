const Task = require("../model/taskModel");

//creating a new task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed } = req.body;
    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      completed: completed === "Yes" || completed === true,
      owner: req.user.id,
    });

    const saved = await task.save();

    res.status(201).json({ task: saved, success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something Went Wrong !",
      success: false,
      error: true,
    });
  }
};

//get all task for loggedIn user
const getTask = async (req, res) => {
  try {
    const task = await Task.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something Went Wrong !",
      success: false,
      error: true,
    });
  }
};

//get single task by id
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    if (!task)
      return res.status(400).json({
        success: false,
        message: "Task Not Found !",
      });

    res.json({ success: true, task });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something Went Wrong !",
      success: false,
      error: true,
    });
  }
};

//update a task
const updateTask = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.completed !== undefined) {
      data.completed = data.completed === "Yes" || data.completed === true;
    }

    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      data,
      { new: true, runValidators: true }
    );

    if (!updated)
      return res
        .status(400)
        .json({ message: "Task not found Or Not Available", success: false });

    res.json({ success: true, task: updated });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something Went Wrong !",
      success: false,
      error: true,
    });
  }
};

//delete a task
const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!deleted)
      return res
        .status(400)
        .json({ message: "Task not found Or Not Available", success: false });

    res.json({ success: true, message: "Task deleted successfully !" });
    
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something Went Wrong !",
      success: false,
      error: true,
    });
  }
};

module.exports = { createTask, getTask, getTaskById, updateTask, deleteTask };
