import type {
  CompetitionSettings,
  GameSession,
  LeaderboardEntry,
  QuestionOverrides,
  QuestionStat,
  QuizSetOverrides,
  Team,
  Winner,
} from "../types";

const TEAM_LIST_KEY = "cybershield_teams";
const SESSION_KEY = "cybershield_session";
const LEADERBOARD_KEY = "cybershield_leaderboard";
const ADMIN_KEY = "cybershield_admin";
const COMPETITION_SETTINGS_KEY = "cybershield_competition_settings";
const QUESTION_OVERRIDES_KEY = "cybershield_question_overrides";
const ADMIN_AUTH_KEY = "cybershield_admin_authed";
const WINNER_KEY = "cybershield_winner";
const CUSTOM_QUESTIONS_KEY = "cybershield_custom_questions";
const QUESTION_EDITS_KEY = "cybershield_question_edits";
const QUIZSET_OVERRIDES_KEY = "cybershield_quizset_overrides";
const QUESTION_STATS_KEY = "cybershield_question_stats";

const DEFAULT_COMPETITION_SETTINGS: CompetitionSettings = {
  started: true,
  ended: false,
  startedAt: null,
  endedAt: null,
  liveMode: false,
};

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const saveTeam = (team: Team) => {
  const teams = getTeams();
  const existingIndex = teams.findIndex((item) => item.id === team.id);
  if (existingIndex >= 0) {
    teams[existingIndex] = team;
  } else {
    teams.push(team);
  }
  window.localStorage.setItem(TEAM_LIST_KEY, JSON.stringify(teams));
};

export const getTeams = (): Team[] => readJson<Team[]>(TEAM_LIST_KEY, []);

export const replaceTeams = (teams: Team[]) => {
  window.localStorage.setItem(TEAM_LIST_KEY, JSON.stringify(teams));
};

export const getCurrentTeam = (): Team | null => {
  const team = readJson<Team | null>("cybershield_current_team", null);
  return team;
};

export const setCurrentTeam = (team: Team | null) => {
  window.localStorage.setItem("cybershield_current_team", JSON.stringify(team));
};

export const saveSession = (session: GameSession) => {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
  void fetch(`${apiUrl}/sessions/${session.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshot: session }),
  }).catch(() => {
    // Local session remains available if the backend is temporarily offline.
  });
};

export const getSession = (): GameSession | null =>
  readJson<GameSession | null>(SESSION_KEY, null);

export const clearSession = () => {
  window.localStorage.removeItem(SESSION_KEY);
};

export const clearAllDemoData = () => {
  window.localStorage.removeItem(TEAM_LIST_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(LEADERBOARD_KEY);
  window.localStorage.removeItem(ADMIN_KEY);
  window.localStorage.removeItem("cybershield_current_team");
  window.localStorage.removeItem(COMPETITION_SETTINGS_KEY);
  window.localStorage.removeItem(QUESTION_OVERRIDES_KEY);
  window.localStorage.removeItem(WINNER_KEY);
  window.localStorage.removeItem(CUSTOM_QUESTIONS_KEY);
  window.localStorage.removeItem(QUESTION_EDITS_KEY);
  window.localStorage.removeItem(QUIZSET_OVERRIDES_KEY);
  window.localStorage.removeItem(QUESTION_STATS_KEY);
};

export const removeTeam = (teamId: string) => {
  const teams = getTeams().filter((team) => team.id !== teamId);
  window.localStorage.setItem(TEAM_LIST_KEY, JSON.stringify(teams));
};

export const getCompetitionSettings = (): CompetitionSettings =>
  readJson<CompetitionSettings>(
    COMPETITION_SETTINGS_KEY,
    DEFAULT_COMPETITION_SETTINGS,
  );

export const saveCompetitionSettings = (settings: CompetitionSettings) => {
  window.localStorage.setItem(
    COMPETITION_SETTINGS_KEY,
    JSON.stringify(settings),
  );
};

export const getQuestionOverrides = (): QuestionOverrides =>
  readJson<QuestionOverrides>(QUESTION_OVERRIDES_KEY, {});

export const setQuestionOverride = (key: string, active: boolean) => {
  const overrides = getQuestionOverrides();
  overrides[key] = active;
  window.localStorage.setItem(
    QUESTION_OVERRIDES_KEY,
    JSON.stringify(overrides),
  );
};

export const saveLeaderboard = (entries: LeaderboardEntry[]) => {
  window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
};

export const getLeaderboard = (): LeaderboardEntry[] =>
  readJson<LeaderboardEntry[]>(LEADERBOARD_KEY, []);

export const saveAdminState = (state: Record<string, unknown>) => {
  window.localStorage.setItem(ADMIN_KEY, JSON.stringify(state));
};

export const getAdminState = (): Record<string, unknown> =>
  readJson<Record<string, unknown>>(ADMIN_KEY, {});

export const getDemoPin = (): string => {
  const envPin = import.meta.env.VITE_DEMO_ADMIN_PIN ?? "1234";
  return String(envPin);
};

// Admin route guard: PIN auth is remembered for the browser tab session (sessionStorage),
// so a refresh of /admin doesn't force re-entering the PIN, but closing the tab clears it.
export const isAdminAuthed = (): boolean => {
  try {
    return (
      window.sessionStorage.getItem(ADMIN_AUTH_KEY) === "true" &&
      Boolean(window.sessionStorage.getItem(ADMIN_TOKEN_KEY))
    );
  } catch {
    return false;
  }
};

export const setAdminAuthed = (value: boolean) => {
  if (value) {
    window.sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
  } else {
    window.sessionStorage.removeItem(ADMIN_AUTH_KEY);
  }
};

const ADMIN_TOKEN_KEY = "cybershield_admin_token";

export const getAdminToken = (): string | null => {
  try {
    return window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAdminToken = (token: string | null) => {
  if (token) {
    window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
};

export const getWinner = (): Winner | null =>
  readJson<Winner | null>(WINNER_KEY, null);

export const saveWinner = (winner: Winner | null) => {
  if (winner) {
    window.localStorage.setItem(WINNER_KEY, JSON.stringify(winner));
  } else {
    window.localStorage.removeItem(WINNER_KEY);
  }
};

// Custom questions/rounds/scenarios added by an admin, per level, layered on top of the
// static data files at read time. Keyed by the level number as a string.
export const getCustomQuestions = <T>(level: number): Record<string, T> =>
  readJson<Record<string, Record<string, T>>>(CUSTOM_QUESTIONS_KEY, {})[
    String(level)
  ] ?? {};

export const saveCustomQuestion = <T extends { id: string }>(
  level: number,
  item: T,
) => {
  const all = readJson<Record<string, Record<string, T>>>(
    CUSTOM_QUESTIONS_KEY,
    {},
  );
  all[String(level)] = { ...(all[String(level)] ?? {}), [item.id]: item };
  window.localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(all));
};

export const deleteCustomQuestion = (level: number, id: string) => {
  const all = readJson<Record<string, Record<string, unknown>>>(
    CUSTOM_QUESTIONS_KEY,
    {},
  );
  if (all[String(level)]) {
    delete all[String(level)][id];
    window.localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(all));
  }
};

// Edits (partial patches) applied over a static question/round/scenario, keyed by level then id.
export const getQuestionEdits = <T>(
  level: number,
): Record<string, Partial<T>> =>
  readJson<Record<string, Record<string, Partial<T>>>>(QUESTION_EDITS_KEY, {})[
    String(level)
  ] ?? {};

export const saveQuestionEdit = <T>(
  level: number,
  id: string,
  patch: Partial<T>,
) => {
  const all = readJson<Record<string, Record<string, Partial<T>>>>(
    QUESTION_EDITS_KEY,
    {},
  );
  all[String(level)] = {
    ...(all[String(level)] ?? {}),
    [id]: { ...(all[String(level)]?.[id] ?? {}), ...patch },
  };
  window.localStorage.setItem(QUESTION_EDITS_KEY, JSON.stringify(all));
};

export const getQuizSetOverrides = (): QuizSetOverrides =>
  readJson<QuizSetOverrides>(QUIZSET_OVERRIDES_KEY, {});

export const setQuizSetOverride = (
  setId: string,
  levelKey: keyof QuizSetOverrides[string],
  questionId: string,
) => {
  const overrides = getQuizSetOverrides();
  overrides[setId] = { ...(overrides[setId] ?? {}), [levelKey]: questionId };
  window.localStorage.setItem(QUIZSET_OVERRIDES_KEY, JSON.stringify(overrides));
};

export const getQuestionStats = (): Record<string, QuestionStat> =>
  readJson<Record<string, QuestionStat>>(QUESTION_STATS_KEY, {});

export const recordQuestionStat = (
  level: number,
  id: string,
  outcome: "shown" | "correct" | "incorrect",
) => {
  const stats = getQuestionStats();
  const key = `${level}:${id}`;
  const current = stats[key] ?? { shown: 0, correct: 0, incorrect: 0 };
  current[outcome] += 1;
  stats[key] = current;
  window.localStorage.setItem(QUESTION_STATS_KEY, JSON.stringify(stats));
};
