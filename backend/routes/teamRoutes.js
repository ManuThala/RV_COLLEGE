import { Router } from "express";
import { Team } from "../models/Team.js";
import { isDatabaseConnected } from "../config/database.js";

const router = Router();

const normalize = (value) => value.trim().toLowerCase();

router.post("/", async (request, response) => {
  if (!isDatabaseConnected()) {
    return response.status(503).json({
      success: false,
      message: "Database is not connected. Configure MONGODB_URI first.",
    });
  }

  const { name, player1, player2 } = request.body;

  if (!name?.trim() || !player1?.trim() || !player2?.trim()) {
    return response.status(400).json({
      success: false,
      message: "Team name, Player 1, and Player 2 are required.",
    });
  }

  const nameKey = normalize(name);
  const player1Key = normalize(player1);
  const player2Key = normalize(player2);

  if (player1Key === player2Key) {
    return response.status(409).json({
      success: false,
      message: "Player 1 and Player 2 must be different people.",
    });
  }

  try {
    const existingTeam = await Team.findOne({
      $or: [
        { nameKey },
        { player1Key },
        { player2Key },
        { player1Key: player2Key },
        { player2Key: player1Key },
        { name: new RegExp(`^${name.trim()}$`, "i") },
        { player1: new RegExp(`^${player1.trim()}$`, "i") },
        { player2: new RegExp(`^${player1.trim()}$`, "i") },
        { player1: new RegExp(`^${player2.trim()}$`, "i") },
        { player2: new RegExp(`^${player2.trim()}$`, "i") },
      ],
    });

    if (existingTeam) {
      return response.status(409).json({
        success: false,
        message:
          "Team name and player names must be unique. One already exists.",
      });
    }

    const team = await Team.create({
      name: name.trim(),
      player1: player1.trim(),
      player2: player2.trim(),
      nameKey,
      player1Key,
      player2Key,
    });
    return response.status(201).json({ success: true, team });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({
        success: false,
        message: "Team name or player name is already registered.",
      });
    }
    return response
      .status(500)
      .json({ success: false, message: error.message });
  }
});

router.get("/", async (_request, response) => {
  if (!isDatabaseConnected()) {
    return response.status(503).json({
      success: false,
      message: "Database is not connected. Configure MONGODB_URI first.",
    });
  }

  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    return response.json({ success: true, teams });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: error.message });
  }
});

export default router;
