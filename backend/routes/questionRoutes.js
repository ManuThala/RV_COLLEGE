import { Router } from "express";
import { isDatabaseConnected } from "../config/database.js";
import { IncidentScenario } from "../models/IncidentScenario.js";
import { MalwareRound } from "../models/MalwareRound.js";
import { PhishingRound } from "../models/PhishingRound.js";
import { Question } from "../models/Question.js";

const router = Router();

const modelByLevel = {
  1: Question,
  2: Question,
  3: PhishingRound,
  4: MalwareRound,
  5: IncidentScenario,
};

const databaseKey = (level, key) => {
  if (level === 3 && key.startsWith("L3-R")) return key.replace("L3-R", "L3-Q");
  if (level === 4 && key.startsWith("L4-R")) return key.replace("L4-R", "L4-Q");
  if (level === 5 && key.startsWith("L5-S")) return key.replace("L5-S", "L5-Q");
  return key;
};

const normalizeAnswer = (value) => String(value ?? "").replace(/\s+/g, "").trim().toLowerCase();

router.get("/:level/:importKey", async (request, response) => {
  if (!isDatabaseConnected()) {
    return response
      .status(503)
      .json({ success: false, message: "Database is not connected." });
  }

  const level = Number(request.params.level);
  const Model = modelByLevel[level];
  if (!Model) {
    return response
      .status(400)
      .json({ success: false, message: "Invalid quiz level." });
  }

  try {
    const projection =
      level <= 2
        ? "-correctOptionId"
        : level === 3
          ? "-correctEmailId"
          : level === 4
            ? "-correctFileId"
            : "-correctSequence";
    const item = await Model.findOne({
      level,
      importKey: databaseKey(level, request.params.importKey),
      active: true,
    })
      .select(projection)
      .lean();

    if (!item) {
      return response
        .status(404)
        .json({ success: false, message: "Question not found." });
    }

    return response.json({ success: true, item });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: error.message });
  }
});

router.post("/:level/:importKey/answer", async (request, response) => {
  if (!isDatabaseConnected()) {
    return response
      .status(503)
      .json({ success: false, message: "Database is not connected." });
  }

  const level = Number(request.params.level);
  const Model = modelByLevel[level];
  if (!Model) {
    return response
      .status(400)
      .json({ success: false, message: "Invalid quiz level." });
  }

  try {
    const projection =
      level <= 2
        ? "+correctOptionId"
        : level === 3
          ? "+correctEmailId"
          : level === 4
            ? "+correctFileId"
            : "+correctSequence";
    const item = await Model.findOne({
      level,
      importKey: databaseKey(level, request.params.importKey),
      active: true,
    })
      .select(projection)
      .lean();

    if (!item) {
      return response
        .status(404)
        .json({ success: false, message: "Question not found." });
    }

    let correct = false;
    let correctAnswer = "";
    if (level <= 2) {
      const submittedOption = String(request.body.optionId ?? "");
      const selectedOption = item.options.find(
        (option) =>
          option.id === submittedOption ||
          normalizeAnswer(option.text) === normalizeAnswer(submittedOption),
      );
      correct = selectedOption?.id === item.correctOptionId;
      correctAnswer =
        item.options.find((option) => option.id === item.correctOptionId)
          ?.text ?? item.correctOptionId;
    } else if (level === 3) {
      const optionId = String(request.body.optionId ?? "");
      correct = optionId === item.correctEmailId;
      correctAnswer =
        item.emails.find((email) => email.id === item.correctEmailId)
          ?.senderEmail ?? item.correctEmailId;
    } else if (level === 4) {
      const optionId = String(request.body.optionId ?? "");
      correct = optionId === item.correctFileId;
      correctAnswer =
        item.files.find((file) => file.id === item.correctFileId)?.name ??
        item.correctFileId;
    } else {
      const orderedIds = Array.isArray(request.body.orderedIds)
        ? request.body.orderedIds
        : [];
      const matches = orderedIds.filter(
        (id, index) => item.correctSequence[index] === id,
      ).length;
      correct =
        item.correctSequence.length > 0 &&
        matches / item.correctSequence.length >= 0.8;
      correctAnswer = item.correctSequence
        .map(
          (id) => item.actions.find((action) => action.id === id)?.text ?? id,
        )
        .join(" -> ");
    }

    return response.json({
      success: true,
      correct,
      correctAnswer,
      explanation: item.explanation,
    });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: error.message });
  }
});

export default router;
