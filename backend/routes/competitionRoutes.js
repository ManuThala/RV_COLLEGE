import { Router } from "express";
import { AdminSettings } from "../models/AdminSettings.js";
import { isDatabaseConnected } from "../config/database.js";

const router = Router();

router.get("/settings", async (_request, response) => {
  if (!isDatabaseConnected()) {
    return response.status(503).json({
      success: false,
      message: "Database is not connected.",
    });
  }

  try {
    const settings =
      (await AdminSettings.findOne({ key: "competition" }).lean()) ??
      (await AdminSettings.create({ key: "competition" })).toObject();
    return response.json({ success: true, settings });
  } catch (error) {
    return response.status(500).json({ success: false, message: error.message });
  }
});

export default router;
