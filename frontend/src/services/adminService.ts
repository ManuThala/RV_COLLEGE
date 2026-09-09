import {
  getAdminToken,
  replaceTeams,
  saveCompetitionSettings,
  saveLeaderboard,
  setAdminToken,
} from "./storageService";
import type { CompetitionSettings, LeaderboardEntry, Team } from "../types";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const adminHeaders = (): Record<string, string> => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const loginAdmin = async (pin: string) => {
  const response = await fetch(`${apiUrl}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  const result = (await response.json()) as {
    success?: boolean;
    token?: string;
    message?: string;
  };
  if (!response.ok || !result.success || !result.token) {
    throw new Error(result.message ?? "Unable to authenticate admin.");
  }
  setAdminToken(result.token);
};

export const logoutAdmin = async () => {
  const token = getAdminToken();
  if (token) {
    await fetch(`${apiUrl}/admin/auth/logout`, {
      method: "POST",
      headers: adminHeaders(),
    }).catch(() => undefined);
  }
  setAdminToken(null);
};

export const syncAdminData = async () => {
  const headers = adminHeaders();
  const [teamsResponse, settingsResponse] = await Promise.all([
    fetch(`${apiUrl}/admin/teams`, { headers }),
    fetch(`${apiUrl}/admin/settings`, { headers }),
  ]);
  if (!teamsResponse.ok || !settingsResponse.ok) {
    throw new Error("Unable to load admin data from the backend.");
  }

  const teamsResult = (await teamsResponse.json()) as {
    teams: Array<Record<string, unknown>>;
  };
  const settingsResult = (await settingsResponse.json()) as {
    settings: CompetitionSettings;
  };

  const teams: Team[] = teamsResult.teams.map((team) => ({
    id: String(team._id ?? team.id),
    name: String(team.name ?? ""),
    player1: String(team.player1 ?? ""),
    player2: String(team.player2 ?? ""),
    createdAt: String(team.createdAt ?? new Date().toISOString()),
  }));
  const leaderboard: LeaderboardEntry[] = teamsResult.teams
    .map((team) => team.leaderboard as Record<string, unknown> | null)
    .filter((entry): entry is Record<string, unknown> => Boolean(entry))
    .map((entry) => ({
      id: String(entry.entryId ?? entry.id ?? entry.teamId),
      teamId: String(entry.teamId),
      teamName: String(entry.teamName ?? ""),
      players: String(entry.players ?? ""),
      currentLevel: Number(entry.currentLevel ?? 1),
      levelTimes: (entry.levelTimes ?? {}) as Record<number, number>,
      totalTime: Number(entry.totalTime ?? 0),
      incorrectAttempts: Number(entry.incorrectAttempts ?? 0),
      status: (entry.status ?? "playing") as LeaderboardEntry["status"],
      completedAt: entry.completedAt ? String(entry.completedAt) : null,
      createdAt: String(entry.createdAtSource ?? entry.createdAt ?? ""),
    }));

  replaceTeams(teams);
  saveLeaderboard(leaderboard);
  saveCompetitionSettings(settingsResult.settings);
};

export const clearBackendAdminData = async () => {
  const response = await fetch(`${apiUrl}/admin/data`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
  };
  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "Unable to clear backend data.");
  }
};
