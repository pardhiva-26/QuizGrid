const express = require("express");
const Game = require("../models/Game");
const router = express.Router();

// Middleware for input validation
const validateGameInput = (req, res, next) => {
  const {
    roomId,
    cellOwnership,
    playerScore,
    computerScore,
    usedCells,
    quizFinished,
  } = req.body;

  if (!roomId) {
    return res.status(400).json({ error: "roomId is required." });
  }
  next();
};

// Save or update game state for a specific room
router.post("/save/:roomId", validateGameInput, async (req, res) => {
  const { roomId, cellOwnership, playerScore, computerScore, usedCells, quizFinished } = req.body;

  try {
    const game = await Game.findOneAndUpdate(
      { roomId },
      { roomId, cellOwnership, playerScore, computerScore, usedCells, quizFinished },
      { upsert: true, new: true }
    );
    console.log("Game State Saved:", req.body);
    res.status(200).json({ message: "Game state saved successfully", game });
  } catch (error) {
    console.error("Error saving game state:", error.message);
    res.status(500).json({ error: "Failed to save game state." });
  }
});

// Get game state by roomId
router.get("/game/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const game = await Game.findOne({ roomId });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.status(200).json({ game });
  } catch (error) {
    console.error("Error fetching game state:", error.message);
    res.status(500).json({ error: "Failed to fetch game state." });
  }
});

module.exports = router;
