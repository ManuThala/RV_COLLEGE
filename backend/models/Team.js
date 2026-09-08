import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    player1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    player2: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    nameKey: { type: String, select: false },
    player1Key: { type: String, select: false },
    player2Key: { type: String, select: false },
  },
  { timestamps: true },
);

teamSchema.index({ nameKey: 1 }, { unique: true, sparse: true });
teamSchema.index({ player1Key: 1 }, { unique: true, sparse: true });
teamSchema.index({ player2Key: 1 }, { unique: true, sparse: true });

export const Team = mongoose.model("Team", teamSchema);
