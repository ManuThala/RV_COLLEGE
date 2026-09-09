import { Router } from "express";
import { isDatabaseConnected } from "../config/database.js";
import { LeaderboardEntry } from "../models/LeaderboardEntry.js";

const router = Router();

router.put("/:teamId", async (request, response) => {
  if (!isDatabaseConnected()) {
    return response
      .status(503)
      .json({ success: false, message: "Database is not connected." });
  }

  const entry = request.body?.entry;
  if (!entry?.id || entry.teamId !== request.params.teamId) {
    return response.status(400).json({
      success: false,
      message: "A valid leaderboard entry is required.",
    });
  }

  try {
    const saved = await LeaderboardEntry.findOneAndUpdate(
      { teamId: request.params.teamId },
      {
        entryId: entry.id,
        teamId: entry.teamId,
        teamName: entry.teamName,
        players: entry.players,
        currentLevel: entry.currentLevel,
        levelTimes: entry.levelTimes ?? {},
        totalTime: entry.totalTime ?? 0,
        incorrectAttempts: entry.incorrectAttempts ?? 0,
        status: entry.status,
        completedAt: entry.completedAt ?? null,
        createdAtSource: entry.createdAt,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    return response.json({ success: true, entry: saved });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: error.message });
  }
});

router.get("/", async (_request, response) => {
  if (!isDatabaseConnected()) {
    return response
      .status(503)
      .json({ success: false, message: "Database is not connected." });
  }

  try {
    const entries = await LeaderboardEntry.find()
      .sort({
        totalTime: 1,
        incorrectAttempts: 1,
        createdAtSource: 1,
      })
      .lean();
    return response.json({ success: true, entries });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: error.message });
  }
});

export default router;
