import mongoose from "mongoose";

const questionOptionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    level: { type: Number, required: true, enum: [1, 2, 3, 4, 5], index: true },
    importKey: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, default: "password", trim: true },
    question: { type: String, required: true, trim: true },
    options: {
      type: [questionOptionSchema],
      required: true,
      validate: (value) => value.length === 5,
    },
    correctOptionId: { type: String, required: true, select: false },
    explanation: { type: String, required: true },
    tip: { type: String, default: "" },
    difficulty: { type: String, default: "Intermediate" },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

questionSchema.index({ level: 1, active: 1 });

export const Question = mongoose.model("Question", questionSchema);
