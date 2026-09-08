import mongoose from "mongoose";

const quizSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    teamId: { type: String, required: true, index: true },
    currentLevel: { type: Number, required: true },
    totalTime: { type: Number, default: 0 },
    completionStatus: { type: String, required: true },
    disqualified: { type: Boolean, default: false },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const QuizSession = mongoose.model("QuizSession", quizSessionSchema);
