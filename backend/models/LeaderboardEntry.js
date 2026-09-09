import mongoose from "mongoose";

const leaderboardEntrySchema = new mongoose.Schema(
  {
    entryId: { type: String, required: true, unique: true, index: true },
    teamId: { type: String, required: true, unique: true, index: true },
    teamName: { type: String, required: true },
    players: { type: String, required: true },
    currentLevel: { type: Number, required: true },
    levelTimes: { type: mongoose.Schema.Types.Mixed, default: {} },
    totalTime: { type: Number, default: 0, index: true },
    incorrectAttempts: { type: Number, default: 0 },
    status: { type: String, required: true, index: true },
    completedAt: { type: String, default: null },
    createdAtSource: { type: String, required: true },
  },
  { timestamps: true },
);

export const LeaderboardEntry = mongoose.model(
  "LeaderboardEntry",
  leaderboardEntrySchema,
);
