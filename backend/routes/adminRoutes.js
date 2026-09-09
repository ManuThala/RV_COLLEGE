import { Router } from "express";
import { AdminSettings } from "../models/AdminSettings.js";
import { LeaderboardEntry } from "../models/LeaderboardEntry.js";
import { QuizSession } from "../models/QuizSession.js";
import { Team } from "../models/Team.js";
import {
  createAdminToken,
  requireAdmin,
  revokeAdminToken,
} from "../middleware/adminAuth.js";
import { isDatabaseConnected } from "../config/database.js";

const router = Router();

const requireDatabase = (request, response, next) => {
  if (!isDatabaseConnected()) {
    return response.status(503).json({
      success: false,
      message: "Database is not connected. Configure MONGODB_URI first.",
    });
  }
  return next();
};

router.post("/auth/login", (request, response) => {
  const configuredPin = process.env.ADMIN_PIN;
  if (!configuredPin) {
    return response.status(503).json({
      success: false,
      message: "ADMIN_PIN is not configured.",
    });
  }

  if (request.body?.pin !== configuredPin) {
    return response.status(401).json({
      success: false,
      message: "Invalid admin PIN.",
    });
  }

  return response.json({ success: true, token: createAdminToken() });
});

router.post("/auth/logout", requireAdmin, (request, response) => {
  revokeAdminToken(request.adminToken);
  return response.json({ success: true });
});

router.use(requireAdmin, requireDatabase);

router.get("/teams", async (_request, response) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 }).lean();
    const entries = await LeaderboardEntry.find().lean();
    const entryByTeam = new Map(entries.map((entry) => [entry.teamId, entry]));
    return response.json({
      success: true,
      teams: teams.map((team) => ({
        ...team,
        leaderboard: entryByTeam.get(team._id.toString()) ?? null,
      })),
    });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: error.message });
  }
});

router.patch("/teams/:teamId/disqualification", async (request, response) => {
  const disqualified = Boolean(request.body?.disqualified);
  try {
    const session = await QuizSession.findOneAndUpdate(
      { teamId: request.params.teamId },
      {
        disqualified,
        ...(disqualified ? { completionStatus: "timed_out" } : {}),
        $set: { "snapshot.disqualified": disqualified },
      },
      { new: true },
    ).lean();
    const leaderboard = await LeaderboardEntry.findOneAndUpdate(
      { teamId: request.params.teamId },
      { status: disqualified ? "disqualified" : "playing" },
      { new: true },
    ).lean();

    if (!session && !leaderboard) {
      return response.status(404).json({
        success: false,
        message: "Team progress was not found.",
      });
    }
    return response.json({ success: true, session, leaderboard });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: error.message });
  }
});

router.delete("/teams/:teamId/progress", async (request, response) => {
  try {
    const [session, leaderboard] = await Promise.all([
      QuizSession.deleteMany({ teamId: request.params.teamId }),
      LeaderboardEntry.deleteMany({ teamId: request.params.teamId }),
    ]);
    return response.json({
      success: true,
      deletedSessions: session.deletedCount,
      deletedLeaderboardEntries: leaderboard.deletedCount,
    });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: error.message });
  }
});

router.get("/settings", async (_request, response) => {
  try {
    const settings =
      (await AdminSettings.findOne({ key: "competition" }).lean()) ??
      (await AdminSettings.create({ key: "competition" })).toObject();
    return response.json({ success: true, settings });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: error.message });
  }
});

router.patch("/settings", async (request, response) => {
  const allowed = ["started", "ended", "liveMode", "startedAt", "endedAt"];
  const update = Object.fromEntries(
    allowed
      .filter((key) => key in (request.body ?? {}))
      .map((key) => [key, request.body[key]]),
  );
  try {
    const settings = await AdminSettings.findOneAndUpdate(
      { key: "competition" },
      { $set: update, $setOnInsert: { key: "competition" } },
      { new: true, upsert: true, runValidators: true },
    ).lean();
    return response.json({ success: true, settings });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: error.message });
  }
});

router.delete("/data", async (_request, response) => {
  try {
    const [teams, sessions, leaderboard, settings] = await Promise.all([
      Team.deleteMany({}),
      QuizSession.deleteMany({}),
      LeaderboardEntry.deleteMany({}),
      AdminSettings.deleteMany({}),
    ]);
    return response.json({
      success: true,
      deleted: {
        teams: teams.deletedCount,
        sessions: sessions.deletedCount,
        leaderboard: leaderboard.deletedCount,
        settings: settings.deletedCount,
      },
    });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: error.message });
  }
});

export default router;
