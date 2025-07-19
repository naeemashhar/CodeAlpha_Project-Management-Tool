const express = require("express");
const cors = require("cors");
const { urlencoded } = require("body-parser");
const connectDB = require("./config/db");
const userRouter = require("./routes/userRoute");
const taskRouter = require("./routes/taskRoute");
require("dotenv/config");


const app = express();

const port = process.env.PORT || 4000;

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//DB connect
connectDB();

//Routes
app.use("/api/user", userRouter);
app.use("/api/tasks", taskRouter);

app.get("/", (req, res) => {
  res.json({ message: "api working" });
});

app.listen(port, () => {
  console.log(`server started on http://localhost:${port}`);
});
