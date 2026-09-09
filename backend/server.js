import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDatabase, isDatabaseConnected } from "./config/database.js";
import questionRoutes from "./routes/questionRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/teams", teamRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_request, response) => {
  response.json({
    success: true,
    message: "Backend is running",
    database: isDatabaseConnected() ? "connected" : "disconnected",
  });
});

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const startServer = async () => {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Quiz backend running at http://localhost:${port}`);
  });
};

startServer();
