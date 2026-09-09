import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "competition" },
    started: { type: Boolean, default: false },
    ended: { type: Boolean, default: false },
    liveMode: { type: Boolean, default: false },
    startedAt: { type: String, default: null },
    endedAt: { type: String, default: null },
  },
  { timestamps: true },
);

export const AdminSettings = mongoose.model(
  "AdminSettings",
  adminSettingsSchema,
);
