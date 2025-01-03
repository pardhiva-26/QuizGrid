const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true }, // Add roomId to track rooms
  cellOwnership: { type: [String], default: Array(25).fill(null) },
  usedCells: { type: [Number], default: [] },
  playerScore: { type: Number, default: 0 },
  computerScore: { type: Number, default: 0 },
  quizFinished: { type: Boolean, default: false },
});

module.exports = mongoose.model('Game', GameSchema);




