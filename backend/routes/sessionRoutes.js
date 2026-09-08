import { Router } from "express";
import { isDatabaseConnected } from "../config/database.js";
import { QuizSession } from "../models/QuizSession.js";

const router = Router();

router.put("/:sessionId", async (request, response) => {
  if (!isDatabaseConnected()) {
    return response
      .status(503)
      .json({ success: false, message: "Database is not connected." });
  }

  const snapshot = request.body?.snapshot;
  if (!snapshot?.teamId || snapshot.id !== request.params.sessionId) {
    return response
      .status(400)
      .json({
        success: false,
        message: "A valid session snapshot is required.",
      });
  }

  try {
    const session = await QuizSession.findOneAndUpdate(
      { sessionId: request.params.sessionId },
      {
        sessionId: request.params.sessionId,
        teamId: snapshot.teamId,
        currentLevel: snapshot.currentLevel,
        totalTime: snapshot.totalTime ?? 0,
        completionStatus: snapshot.completionStatus,
        disqualified: Boolean(snapshot.disqualified),
        snapshot,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    return response.json({ success: true, session });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: error.message });
  }
});

router.get("/:sessionId", async (request, response) => {
  if (!isDatabaseConnected()) {
    return response
      .status(503)
      .json({ success: false, message: "Database is not connected." });
  }

  const session = await QuizSession.findOne({
    sessionId: request.params.sessionId,
  }).lean();
  if (!session)
    return response
      .status(404)
      .json({ success: false, message: "Session not found." });
  return response.json({ success: true, session });
});

export default router;
