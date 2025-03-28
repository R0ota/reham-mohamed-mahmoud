const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const todoRoutes = require("./routes/todo");
const userRoutes = require("./routes/user");
const todosModel = require("./models/todo");
const { connectToDatabase } = require("./db.connection");

dotenv.config();

const app = express();
const PORT = 3333;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/user", userRoutes);
app.use("/todo", todoRoutes);

// Root route - fetch all todos
app.get("/", async (_req, res) => {
  try {
    const todos = await todosModel.find();
    res.status(200).json({ data: todos });
  } catch (error) {
    res.status(500).json({ message: "Error fetching todos" });
  }
});

// Handle not found
app.use("*", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Connect to DB and start server
connectToDatabase()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
