const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB successfully."))
  .catch((error) => console.error("Failed to connect to MongoDB:", error.message));

// Middleware
app.use(express.json());

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", gameRoutes);

// Socket.IO setup for real-time updates
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//   },
// });

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
