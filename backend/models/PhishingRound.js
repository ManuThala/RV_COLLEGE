import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    senderName: { type: String, default: "" },
    senderEmail: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
  },
  { _id: false },
);

const phishingRoundSchema = new mongoose.Schema(
  {
    level: { type: Number, default: 3, immutable: true },
    type: { type: String, default: "phishing", immutable: true },
    title: { type: String, default: "Identify the phishing email" },
    emails: {
      type: [emailSchema],
      required: true,
      validate: (value) => value.length === 5,
    },
    correctEmailId: { type: String, required: true, select: false },
    explanation: { type: String, required: true },
    difficulty: { type: String, default: "Advanced" },
    active: { type: Boolean, default: true, index: true },
    importKey: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true },
);

phishingRoundSchema.index({ level: 1, active: 1 });

export const PhishingRound = mongoose.model(
  "PhishingRound",
  phishingRoundSchema,
);
