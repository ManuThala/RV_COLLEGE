import mongoose from "mongoose";

const actionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false },
);

const incidentScenarioSchema = new mongoose.Schema(
  {
    level: { type: Number, default: 5, immutable: true },
    type: { type: String, default: "incident-response", immutable: true },
    title: { type: String, default: "Secure the Network" },
    description: { type: String, required: true, trim: true },
    timerSeconds: { type: Number, default: 60, immutable: true },
    actions: {
      type: [actionSchema],
      required: true,
      validate: (value) => value.length >= 5 && value.length <= 10,
    },
    correctSequence: { type: [String], required: true, select: false },
    explanation: { type: String, required: true },
    difficulty: { type: String, default: "Advanced" },
    active: { type: Boolean, default: true, index: true },
    importKey: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true },
);

incidentScenarioSchema.index({ level: 1, active: 1 });

export const IncidentScenario = mongoose.model(
  "IncidentScenario",
  incidentScenarioSchema,
);
