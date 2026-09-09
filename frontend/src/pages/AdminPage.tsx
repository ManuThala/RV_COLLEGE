import { useEffect, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Copy,
  Crown,
  Download,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  ShieldAlert,
  Square,
  Trash2,
  Tv,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminRouteGuard from "../components/AdminRouteGuard";
import {
  clearAllDemoData,
  deleteCustomQuestion,
  getCompetitionSettings,
  getLeaderboard,
  getQuestionOverrides,
  getQuestionStats,
  getQuizSetOverrides,
  getTeams,
  getWinner,
  saveCompetitionSettings,
  saveCustomQuestion,
  saveQuestionEdit,
  saveWinner,
  setQuestionOverride,
  setQuizSetOverride,
} from "../services/storageService";
import {
  resetTeamProgress,
  setTeamDisqualified,
} from "../services/leaderboardService";
import {
  getAllLevel1Questions,
  getAllLevel2Questions,
  getAllLevel3Rounds,
  getAllLevel4Rounds,
  getAllLevel5Scenarios,
  getLevel1QuestionPool,
  getLevel2QuestionPool,
  getLevel3RoundPool,
  getLevel4RoundPool,
  getLevel5ScenarioPool,
} from "../services/gameService";
import { quizSets } from "../data/quizSets";
import type { QuizSetLevelKey, Winner } from "../types";
import { syncAdminData } from "../services/adminService";

type QuestionRow = {
  id: string;
  label: string;
  active: boolean;
  custom: boolean;
};
type Tab = "overview" | "teams" | "questions" | "winner";

function AdminPage() {
  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="cyber-button">
            ← Back home
          </Link>
          <span className="level-chip">Admin Console</span>
        </div>

        <div className="glass-panel rounded-3xl p-8 md:p-10">
          <div className="mb-8 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-cyan-300" />
            <h1 className="text-3xl font-black text-white">Admin Console</h1>
          </div>

          <AdminRouteGuard>{() => <AdminConsole />}</AdminRouteGuard>
        </div>
      </div>
    </div>
  );
}

function AdminConsole() {
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [questionLevel, setQuestionLevel] = useState(1);
  const [questionSearch, setQuestionSearch] = useState("");
  const [formState, setFormState] = useState<FormState | null>(null);
  const [, forceRefresh] = useState(0);

  const refresh = () => forceRefresh((t) => t + 1);

  useEffect(() => {
    void syncAdminData()
      .then(() => refresh())
      .catch((error) =>
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load admin data from the backend.",
        ),
      );
  }, []);

  const teams = getTeams();
  const leaderboard = getLeaderboard();
  const overrides = getQuestionOverrides();
  const questionStats = getQuestionStats();
  const competitionSettings = getCompetitionSettings();
  const quizSetOverrides = getQuizSetOverrides();
  const winner = getWinner();

  const playingCount = leaderboard.filter((e) => e.status === "playing").length;
  const completedEntries = leaderboard
    .filter((e) => e.status === "completed")
    .sort((a, b) => a.totalTime - b.totalTime);
  const disqualifiedCount = leaderboard.filter(
    (e) => e.status === "disqualified",
  ).length;
  const fastestTime =
    completedEntries.length > 0 ? completedEntries[0].totalTime : null;
  const averageTime =
    completedEntries.length > 0
      ? Math.round(
          completedEntries.reduce((sum, e) => sum + e.totalTime, 0) /
            completedEntries.length,
        )
      : null;

  const handleClearDemo = () => {
    if (
      window.confirm(
        "Are you sure? This will delete all teams, sessions, and leaderboard data.",
      )
    ) {
      clearAllDemoData();
      refresh();
      setMessage("All data cleared from this device.");
    }
  };

  const handleReset = (teamId: string, teamName: string) => {
    if (
      !window.confirm(
        `Reset progress for "${teamName}"? This clears their leaderboard entry and active session.`,
      )
    )
      return;
    resetTeamProgress(teamId);
    refresh();
    setMessage(`Progress reset for "${teamName}".`);
  };

  const handleToggleDisqualify = (
    teamId: string,
    teamName: string,
    currentlyDisqualified: boolean,
  ) => {
    setTeamDisqualified(teamId, !currentlyDisqualified);
    refresh();
    setMessage(
      !currentlyDisqualified
        ? `Team "${teamName}" has been disqualified.`
        : `Team "${teamName}" has been re-qualified.`,
    );
  };

  const handleStartCompetition = () => {
    saveCompetitionSettings({
      ...competitionSettings,
      started: true,
      ended: false,
      startedAt: new Date().toISOString(),
    });
    refresh();
    setMessage("Competition started. Registration is now open.");
  };

  const handleEndCompetition = () => {
    if (
      !window.confirm(
        "End the competition? This closes new registrations and new challenge starts.",
      )
    )
      return;
    saveCompetitionSettings({
      ...competitionSettings,
      ended: true,
      endedAt: new Date().toISOString(),
    });
    refresh();
    setMessage("Competition ended. New registrations are closed.");
  };

  const handleToggleLiveMode = () => {
    saveCompetitionSettings({
      ...competitionSettings,
      liveMode: !competitionSettings.liveMode,
    });
    refresh();
  };

  const handleToggleQuestion = (
    level: number,
    id: string,
    currentActive: boolean,
  ) => {
    setQuestionOverride(`${level}:${id}`, !currentActive);
    refresh();
  };

  const handleExportCSV = () => {
    if (leaderboard.length === 0) {
      setMessage("No leaderboard data to export.");
      return;
    }
    const sorted = [...leaderboard].sort((a, b) => {
      if (a.totalTime !== b.totalTime) return a.totalTime - b.totalTime;
      return a.incorrectAttempts - b.incorrectAttempts;
    });
    const headers = [
      "Rank",
      "Team Name",
      "Players",
      "Current Level",
      "L1 Time (s)",
      "L2 Time (s)",
      "L3 Time (s)",
      "L4 Time (s)",
      "L5 Time (s)",
      "Incorrect Attempts",
      "Total Time (s)",
      "Status",
      "Created At",
    ];
    const rows = sorted.map((entry, index) => [
      index + 1,
      entry.teamName,
      entry.players,
      entry.currentLevel,
      entry.levelTimes?.[1] ?? 0,
      entry.levelTimes?.[2] ?? 0,
      entry.levelTimes?.[3] ?? 0,
      entry.levelTimes?.[4] ?? 0,
      entry.levelTimes?.[5] ?? 0,
      entry.incorrectAttempts,
      entry.totalTime,
      entry.status,
      new Date(entry.createdAt).toLocaleString(),
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `cybershield-leaderboard-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMessage(`Exported ${leaderboard.length} teams to CSV.`);
  };

  // ---- Question management list: ALL items regardless of active state, so a disabled
  // item stays visible and can be re-enabled (the gameplay-only pools filter these out). ----
  const poolForLevel = (level: number): QuestionRow[] => {
    if (level === 1)
      return getAllLevel1Questions().map((q) => ({
        id: q.id,
        label: q.question,
        active: q.active,
        custom: q.id.startsWith("CUSTOM-"),
      }));
    if (level === 2)
      return getAllLevel2Questions().map((q) => ({
        id: q.id,
        label: q.question,
        active: q.active,
        custom: q.id.startsWith("CUSTOM-"),
      }));
    if (level === 3)
      return getAllLevel3Rounds().map((r) => ({
        id: r.id,
        label: r.title,
        active: r.active,
        custom: r.id.startsWith("CUSTOM-"),
      }));
    if (level === 4)
      return getAllLevel4Rounds().map((r) => ({
        id: r.id,
        label: r.title,
        active: r.active,
        custom: r.id.startsWith("CUSTOM-"),
      }));
    return getAllLevel5Scenarios().map((s) => ({
      id: s.id,
      label: s.title,
      active: s.active,
      custom: s.id.startsWith("CUSTOM-"),
    }));
  };

  // ---- Quiz-set assignment only offers currently-active items (assigning a disabled item
  // would just be skipped by selectRandomSet anyway). ----
  const assignablePoolForLevel = (level: number): QuestionRow[] => {
    if (level === 1)
      return getLevel1QuestionPool().map((q) => ({
        id: q.id,
        label: q.question,
        active: q.active,
        custom: q.id.startsWith("CUSTOM-"),
      }));
    if (level === 2)
      return getLevel2QuestionPool().map((q) => ({
        id: q.id,
        label: q.question,
        active: q.active,
        custom: q.id.startsWith("CUSTOM-"),
      }));
    if (level === 3)
      return getLevel3RoundPool().map((r) => ({
        id: r.id,
        label: r.title,
        active: r.active,
        custom: r.id.startsWith("CUSTOM-"),
      }));
    if (level === 4)
      return getLevel4RoundPool().map((r) => ({
        id: r.id,
        label: r.title,
        active: r.active,
        custom: r.id.startsWith("CUSTOM-"),
      }));
    return getLevel5ScenarioPool().map((s) => ({
      id: s.id,
      label: s.title,
      active: s.active,
      custom: s.id.startsWith("CUSTOM-"),
    }));
  };

  const effectiveActive = (level: number, item: QuestionRow) =>
    overrides[`${level}:${item.id}`] ?? item.active;
  const currentPool = poolForLevel(questionLevel);
  const filteredQuestions = currentPool.filter((item) => {
    const term = questionSearch.trim().toLowerCase();
    if (!term) return true;
    return (
      item.id.toLowerCase().includes(term) ||
      item.label.toLowerCase().includes(term)
    );
  });
  const activeCountForLevel = currentPool.filter((item) =>
    effectiveActive(questionLevel, item),
  ).length;

  const openAddForm = (level: number) => setFormState(createBlankForm(level));
  const openEditForm = (level: number, id: string) => {
    const data = getFullItem(level, id);
    if (data)
      setFormState({ level, mode: "edit", ...data } as unknown as FormState);
  };
  const openDuplicateForm = (level: number, id: string) => {
    const data = getFullItem(level, id);
    if (!data) return;
    const newId = `CUSTOM-${level}-${Date.now()}`;
    setFormState({
      level,
      mode: "add",
      ...cloneForDuplicate(level, data),
      id: newId,
    } as unknown as FormState);
  };

  const handleSaveForm = () => {
    if (!formState) return;
    const { level, mode, id } = formState;
    const item = buildItemFromForm(formState);
    if (mode === "add") {
      saveCustomQuestion(level, item);
      setMessage(`Added new item "${id}" to Level ${level}.`);
    } else if (id.startsWith("CUSTOM-")) {
      saveCustomQuestion(level, item);
      setMessage(`Updated custom item "${id}".`);
    } else {
      saveQuestionEdit(level, id, item);
      setMessage(`Saved edits to "${id}".`);
    }
    setFormState(null);
    refresh();
  };

  const handleDeleteCustom = (level: number, id: string) => {
    if (!window.confirm(`Delete custom item "${id}"? This cannot be undone.`))
      return;
    deleteCustomQuestion(level, id);
    refresh();
    setMessage(`Deleted "${id}".`);
  };

  const handleAssignQuizSet = (
    setId: string,
    levelKey: QuizSetLevelKey,
    questionId: string,
  ) => {
    setQuizSetOverride(setId, levelKey, questionId);
    refresh();
    setMessage(`Quiz set ${setId} reassigned.`);
  };

  const handleSelectWinner = (
    entry: (typeof completedEntries)[number],
    rank: number,
  ) => {
    if (
      !window.confirm(
        `Select "${entry.teamName}" as the winner? You can change or clear this later.`,
      )
    )
      return;
    const next: Winner = {
      teamId: entry.teamId,
      teamName: entry.teamName,
      players: entry.players,
      totalTime: entry.totalTime,
      rank,
      selectedAt: new Date().toISOString(),
      confirmed: false,
    };
    saveWinner(next);
    refresh();
    setMessage(
      `"${entry.teamName}" selected as winner — confirm to announce on /winner.`,
    );
  };

  const handleConfirmWinner = () => {
    if (!winner) return;
    saveWinner({ ...winner, confirmed: true });
    refresh();
    setMessage(`Winner announcement confirmed and live on /winner.`);
  };

  const handleClearWinner = () => {
    if (!window.confirm("Clear the announced winner?")) return;
    saveWinner(null);
    refresh();
    setMessage("Winner cleared.");
  };

  return (
    <>
      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 text-cyan-100">
        Data is stored on this device. Multi-device real-time competition
        requires backend integration.
      </div>

      <div className="my-6 flex flex-wrap gap-2 border-b border-slate-700 pb-4">
        {(["overview", "teams", "questions", "winner"] as Tab[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
              tab === key
                ? "border border-cyan-400 bg-cyan-500/20 text-cyan-100"
                : "border border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <StatCard
              label="Teams Registered"
              value={teams.length}
              color="text-white"
            />
            <StatCard
              label="Currently Playing"
              value={playingCount}
              color="text-amber-300"
            />
            <StatCard
              label="Completed"
              value={completedEntries.length}
              color="text-green-400"
            />
            <StatCard
              label="Disqualified"
              value={disqualifiedCount}
              color="text-red-400"
            />
            <StatCard
              label="Fastest Time"
              value={fastestTime !== null ? `${fastestTime}s` : "—"}
              color="text-cyan-300"
            />
            <StatCard
              label="Average Time"
              value={averageTime !== null ? `${averageTime}s` : "—"}
              color="text-cyan-300"
            />
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">
              Competition Control
            </h2>
            <div className="mb-4 flex items-center gap-3 text-sm">
              <span className="text-slate-400">Status:</span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  competitionSettings.ended
                    ? "border-red-500/40 bg-red-500/10 text-red-200"
                    : competitionSettings.started
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : "border-slate-600 bg-slate-800 text-slate-300"
                }`}
              >
                {competitionSettings.ended
                  ? "Ended"
                  : competitionSettings.started
                    ? "In Progress"
                    : "Not Started"}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <button
                onClick={handleStartCompetition}
                disabled={
                  competitionSettings.started && !competitionSettings.ended
                }
                className="cyber-button-primary flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play className="h-4 w-4" /> Start Competition
              </button>
              <button
                onClick={handleEndCompetition}
                disabled={competitionSettings.ended}
                className="cyber-button-danger flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Square className="h-4 w-4" /> End Competition
              </button>
              <button
                onClick={handleStartCompetition}
                disabled={!competitionSettings.ended}
                className="flex items-center justify-center gap-2 rounded-lg border border-emerald-600 px-4 py-3 font-semibold text-emerald-300 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" /> Reopen Competition
              </button>
            </div>
            <button
              onClick={handleToggleLiveMode}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition ${
                competitionSettings.liveMode
                  ? "border border-red-500/50 bg-red-500/20 text-red-100"
                  : "border border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500"
              }`}
            >
              <Tv className="h-4 w-4" /> Live Mode:{" "}
              {competitionSettings.liveMode ? "ON" : "OFF"}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              onClick={handleExportCSV}
              className="cyber-button-primary flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" /> Export Leaderboard (CSV)
            </button>
            <button
              onClick={handleClearDemo}
              className="cyber-button-danger flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> Clear All Data
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Link to="/leaderboard" className="cyber-button text-center">
              View Full Leaderboard
            </Link>
          </div>
        </div>
      )}

      {tab === "teams" && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="mb-4 text-xl font-bold text-white">
            Teams ({teams.length})
          </h2>
          {teams.length === 0 ? (
            <p className="text-slate-400">No teams registered yet</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full min-w-[1000px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-800/80 text-left text-xs uppercase tracking-[0.15em] text-slate-400">
                    <th className="px-3 py-3">Team</th>
                    <th className="px-3 py-3 text-center">Level</th>
                    <th className="px-3 py-3 text-right">L1</th>
                    <th className="px-3 py-3 text-right">L2</th>
                    <th className="px-3 py-3 text-right">L3</th>
                    <th className="px-3 py-3 text-right">L4</th>
                    <th className="px-3 py-3 text-right">L5</th>
                    <th className="px-3 py-3 text-right">Total</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => {
                    const entry = leaderboard.find((e) => e.teamId === team.id);
                    const disqualified = entry?.status === "disqualified";
                    return (
                      <tr
                        key={team.id}
                        className="border-t border-slate-800 hover:bg-slate-800/40"
                      >
                        <td className="px-3 py-3">
                          <p className="font-semibold text-white">
                            {team.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {team.player1}, {team.player2}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-200">
                          {entry ? `${entry.currentLevel}/5` : "—"}
                        </td>
                        {[1, 2, 3, 4, 5].map((level) => (
                          <td
                            key={level}
                            className="px-3 py-3 text-right text-slate-300"
                          >
                            {entry?.levelTimes?.[level]
                              ? `${entry.levelTimes[level]}s`
                              : "—"}
                          </td>
                        ))}
                        <td className="px-3 py-3 text-right font-bold text-white">
                          {entry ? `${entry.totalTime}s` : "—"}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="rounded-full border border-slate-600 px-2 py-1 text-xs uppercase text-slate-200">
                            {entry?.status ?? "Not started"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleReset(team.id, team.name)}
                              title="Reset progress"
                              className="rounded-lg border border-slate-600 p-2 text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleDisqualify(
                                  team.id,
                                  team.name,
                                  Boolean(disqualified),
                                )
                              }
                              title={
                                disqualified
                                  ? "Re-qualify team"
                                  : "Disqualify team"
                              }
                              className={`rounded-lg border p-2 ${disqualified ? "border-emerald-600 text-emerald-300 hover:border-emerald-400" : "border-red-600 text-red-300 hover:border-red-400"}`}
                            >
                              {disqualified ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "questions" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-white">
                Question Management
              </h2>
              <button
                onClick={() => openAddForm(questionLevel)}
                className="cyber-button-primary flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" /> Add Question
              </button>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setQuestionLevel(level)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    questionLevel === level
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                      : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  Level {level}
                </button>
              ))}
            </div>

            <div className="mb-4 flex items-center justify-between gap-4">
              <input
                value={questionSearch}
                onChange={(event) => setQuestionSearch(event.target.value)}
                placeholder="Search by id or text..."
                className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2 text-white outline-none transition focus:border-cyan-400"
              />
              <p className="whitespace-nowrap text-sm text-slate-400">
                {activeCountForLevel} / {currentPool.length} active
              </p>
            </div>

            <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
              {filteredQuestions.map((item) => {
                const active = effectiveActive(questionLevel, item);
                const stat = questionStats[`${questionLevel}:${item.id}`];
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/70 bg-slate-800/40 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-cyan-300">
                        {item.id}
                        {item.custom && (
                          <span className="rounded border border-purple-500/40 bg-purple-500/10 px-1.5 py-0.5 text-[10px] text-purple-200">
                            custom
                          </span>
                        )}
                      </p>
                      <p className="truncate text-sm text-slate-200">
                        {item.label}
                      </p>
                      {stat && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          shown {stat.shown} · correct {stat.correct} ·
                          incorrect {stat.incorrect}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => openEditForm(questionLevel, item.id)}
                        title="Edit"
                        className="rounded-lg border border-slate-600 p-1.5 text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          openDuplicateForm(questionLevel, item.id)
                        }
                        title="Duplicate"
                        className="rounded-lg border border-slate-600 p-1.5 text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      {item.custom && (
                        <button
                          onClick={() =>
                            handleDeleteCustom(questionLevel, item.id)
                          }
                          title="Delete custom item"
                          className="rounded-lg border border-red-600 p-1.5 text-red-300 hover:border-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleToggleQuestion(questionLevel, item.id, active)
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                          active
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                            : "border-slate-600 bg-slate-800 text-slate-400"
                        }`}
                      >
                        {active ? "Active" : "Disabled"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">
              Quiz Set Assignments
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              Reassign which question/round/scenario each of the 10 quiz sets
              uses per level — this is what wires a new or edited question into
              live gameplay.
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-800/80 text-left text-xs uppercase tracking-[0.15em] text-slate-400">
                    <th className="px-3 py-2">Set</th>
                    <th className="px-3 py-2">Level 1</th>
                    <th className="px-3 py-2">Level 2</th>
                    <th className="px-3 py-2">Level 3</th>
                    <th className="px-3 py-2">Level 4</th>
                    <th className="px-3 py-2">Level 5</th>
                  </tr>
                </thead>
                <tbody>
                  {quizSets.map((set) => {
                    const override = quizSetOverrides[set.id];
                    const levelKeys: { key: QuizSetLevelKey; level: number }[] =
                      [
                        { key: "level1QuestionId", level: 1 },
                        { key: "level2QuestionId", level: 2 },
                        { key: "level3RoundId", level: 3 },
                        { key: "level4RoundId", level: 4 },
                        { key: "level5ScenarioId", level: 5 },
                      ];
                    return (
                      <tr key={set.id} className="border-t border-slate-800">
                        <td className="px-3 py-2 font-semibold text-white">
                          {set.id}
                        </td>
                        {levelKeys.map(({ key, level }) => {
                          const value = override?.[key] ?? set[key];
                          const assignable = assignablePoolForLevel(level);
                          // Keep the currently-assigned item selectable even if it has since been disabled.
                          const pool = assignable.some(
                            (item) => item.id === value,
                          )
                            ? assignable
                            : [
                                ...poolForLevel(level).filter(
                                  (item) => item.id === value,
                                ),
                                ...assignable,
                              ];
                          return (
                            <td key={key} className="px-3 py-2">
                              <select
                                value={value}
                                onChange={(event) =>
                                  handleAssignQuizSet(
                                    set.id,
                                    key,
                                    event.target.value,
                                  )
                                }
                                className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs text-slate-200"
                              >
                                {pool.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.id}
                                  </option>
                                ))}
                              </select>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "winner" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">
              Winner Selection
            </h2>
            {winner ? (
              <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                <div className="flex items-center gap-3">
                  <Crown className="h-6 w-6 text-yellow-300" />
                  <div>
                    <p className="font-bold text-white">{winner.teamName}</p>
                    <p className="text-sm text-yellow-100/80">
                      {winner.players} · {winner.totalTime}s · rank #
                      {winner.rank}
                    </p>
                  </div>
                  <span
                    className={`ml-auto rounded-full border px-3 py-1 text-xs font-semibold uppercase ${winner.confirmed ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-amber-500/40 bg-amber-500/10 text-amber-200"}`}
                  >
                    {winner.confirmed
                      ? "Announced on /winner"
                      : "Not yet confirmed"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {!winner.confirmed && (
                    <button
                      onClick={handleConfirmWinner}
                      className="cyber-button-primary text-sm"
                    >
                      Confirm &amp; Announce
                    </button>
                  )}
                  <Link to="/winner" className="cyber-button text-sm">
                    View /winner page
                  </Link>
                  <button
                    onClick={handleClearWinner}
                    className="cyber-button-danger flex items-center gap-2 text-sm"
                  >
                    <X className="h-4 w-4" /> Clear Winner
                  </button>
                </div>
              </div>
            ) : (
              <p className="mb-6 text-slate-400">
                No winner selected yet. Pick a team from the completed
                leaderboard below.
              </p>
            )}

            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Completed Teams (fastest first)
            </h3>
            {completedEntries.length === 0 ? (
              <p className="text-slate-400">
                No teams have completed the challenge yet.
              </p>
            ) : (
              <div className="space-y-2">
                {completedEntries.slice(0, 10).map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/70 bg-slate-800/40 p-3"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        #{index + 1} {entry.teamName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {entry.players} · {entry.totalTime}s
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectWinner(entry, index + 1)}
                      disabled={winner?.teamId === entry.teamId}
                      className="cyber-button-primary text-xs disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {winner?.teamId === entry.teamId
                        ? "Selected"
                        : "Select as Winner"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {message && (
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-200">
          <ShieldAlert className="h-4 w-4 text-cyan-300" />
          {message}
        </div>
      )}

      {formState && (
        <QuestionFormPanel
          state={formState}
          onChange={setFormState}
          onSave={handleSaveForm}
          onCancel={() => setFormState(null)}
        />
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Question add/edit/duplicate form. Level 1 & 2 support full field editing.
// Level 3–5 (nested emails/files/action lists) support title + active editing
// and full-object duplication; deep nested-content editing is out of scope here.
// ---------------------------------------------------------------------------

type FormState =
  | {
      level: 1;
      mode: "add" | "edit";
      id: string;
      question: string;
      options: { id: string; text: string }[];
      correctOptionId: string;
      explanation: string;
      tip: string;
      difficulty: string;
      active: boolean;
    }
  | {
      level: 2;
      mode: "add" | "edit";
      id: string;
      question: string;
      options: string[];
      correctOption: string;
      explanation: string;
      difficulty: string;
      active: boolean;
    }
  | {
      level: 3 | 4 | 5;
      mode: "add" | "edit";
      id: string;
      title: string;
      active: boolean;
      rest: Record<string, unknown>;
    };

function createBlankForm(level: number): FormState {
  const id = `CUSTOM-${level}-${Date.now()}`;
  if (level === 1) {
    return {
      level: 1,
      mode: "add",
      id,
      question: "",
      options: [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
        { id: "E", text: "" },
      ],
      correctOptionId: "A",
      explanation: "",
      tip: "",
      difficulty: "Easy",
      active: true,
    };
  }
  if (level === 2) {
    return {
      level: 2,
      mode: "add",
      id,
      question: "",
      options: ["", "", "", "", ""],
      correctOption: "",
      explanation: "",
      difficulty: "Easy",
      active: true,
    };
  }
  return {
    level: level as 3 | 4 | 5,
    mode: "add",
    id,
    title: "",
    active: true,
    rest: {},
  };
}

function getFullItem(
  level: number,
  id: string,
): Record<string, unknown> | null {
  if (level === 1) {
    const item = getAllLevel1Questions().find((q) => q.id === id);
    if (!item) return null;
    return {
      id: item.id,
      question: item.question,
      options: item.options,
      correctOptionId: item.correctOptionId,
      explanation: item.explanation,
      tip: item.tip,
      difficulty: item.difficulty,
      active: item.active,
    };
  }
  if (level === 2) {
    const item = getAllLevel2Questions().find((q) => q.id === id);
    if (!item) return null;
    return {
      id: item.id,
      question: item.question,
      options: item.options,
      correctOption: item.correctOption,
      explanation: item.explanation,
      difficulty: item.difficulty,
      active: item.active,
    };
  }
  const pool: { id: string; title: string; active: boolean }[] =
    level === 3
      ? getAllLevel3Rounds()
      : level === 4
        ? getAllLevel4Rounds()
        : getAllLevel5Scenarios();
  const item = pool.find((entry) => entry.id === id);
  if (!item) return null;
  const rest: Record<string, unknown> = { ...item };
  delete rest.id;
  delete rest.title;
  delete rest.active;
  return { id: item.id, title: item.title, active: item.active, rest };
}

function cloneForDuplicate(
  level: number,
  data: Record<string, unknown>,
): Record<string, unknown> {
  if (level === 1 || level === 2)
    return { ...data, question: `${data.question} (Copy)` };
  return {
    ...data,
    title: `${data.title} (Copy)`,
    rest: JSON.parse(JSON.stringify(data.rest)),
  };
}

function buildItemFromForm(
  state: FormState,
): { id: string } & Record<string, unknown> {
  if (state.level === 1) {
    return {
      id: state.id,
      question: state.question,
      options: state.options,
      correctOptionId: state.correctOptionId,
      explanation: state.explanation,
      tip: state.tip,
      difficulty: state.difficulty,
      active: state.active,
    };
  }
  if (state.level === 2) {
    return {
      id: state.id,
      question: state.question,
      options: state.options,
      correctOption: state.correctOption,
      explanation: state.explanation,
      difficulty: state.difficulty,
      active: state.active,
    };
  }
  return {
    id: state.id,
    title: state.title,
    active: state.active,
    ...state.rest,
  };
}

function QuestionFormPanel({
  state,
  onChange,
  onSave,
  onCancel,
}: {
  state: FormState;
  onChange: (s: FormState) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="glass-panel max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {state.mode === "add" ? "Add" : "Edit"} Level {state.level} Item
          </h3>
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-600 p-1.5 text-slate-300 hover:border-slate-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <p className="text-xs uppercase tracking-wide text-cyan-300">
            ID: {state.id}
          </p>

          {state.level === 1 && (
            <>
              <Field label="Question">
                <input
                  value={state.question}
                  onChange={(e) =>
                    onChange({ ...state, question: e.target.value })
                  }
                  className="admin-input"
                />
              </Field>
              {state.options.map((opt, idx) => (
                <Field key={opt.id} label={`Option ${opt.id}`}>
                  <input
                    value={opt.text}
                    onChange={(e) => {
                      const options = [...state.options];
                      options[idx] = { ...opt, text: e.target.value };
                      onChange({ ...state, options });
                    }}
                    className="admin-input"
                  />
                </Field>
              ))}
              <Field label="Correct option">
                <select
                  value={state.correctOptionId}
                  onChange={(e) =>
                    onChange({ ...state, correctOptionId: e.target.value })
                  }
                  className="admin-input"
                >
                  {state.options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.id}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Explanation">
                <input
                  value={state.explanation}
                  onChange={(e) =>
                    onChange({ ...state, explanation: e.target.value })
                  }
                  className="admin-input"
                />
              </Field>
              <Field label="Tip">
                <input
                  value={state.tip}
                  onChange={(e) => onChange({ ...state, tip: e.target.value })}
                  className="admin-input"
                />
              </Field>
            </>
          )}

          {state.level === 2 && (
            <>
              <Field label="Question">
                <input
                  value={state.question}
                  onChange={(e) =>
                    onChange({ ...state, question: e.target.value })
                  }
                  className="admin-input"
                />
              </Field>
              {state.options.map((opt, idx) => (
                <Field key={idx} label={`Option ${idx + 1}`}>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const options = [...state.options];
                      options[idx] = e.target.value;
                      onChange({ ...state, options });
                    }}
                    className="admin-input"
                  />
                </Field>
              ))}
              <Field label="Correct option (must match one option exactly)">
                <input
                  value={state.correctOption}
                  onChange={(e) =>
                    onChange({ ...state, correctOption: e.target.value })
                  }
                  className="admin-input"
                />
              </Field>
              <Field label="Explanation">
                <input
                  value={state.explanation}
                  onChange={(e) =>
                    onChange({ ...state, explanation: e.target.value })
                  }
                  className="admin-input"
                />
              </Field>
            </>
          )}

          {(state.level === 3 || state.level === 4 || state.level === 5) && (
            <>
              <Field label="Title">
                <input
                  value={state.title}
                  onChange={(e) =>
                    onChange({ ...state, title: e.target.value })
                  }
                  className="admin-input"
                />
              </Field>
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                Deep content editing (emails/files/response actions) isn't
                supported in this form — duplicate an existing item to clone its
                full nested content, then adjust the title/active state here.
              </p>
            </>
          )}

          <Field label="Active">
            <select
              value={state.active ? "true" : "false"}
              onChange={(e) =>
                onChange({ ...state, active: e.target.value === "true" })
              }
              className="admin-input"
            >
              <option value="true">Active</option>
              <option value="false">Disabled</option>
            </select>
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="cyber-button">
            Cancel
          </button>
          <button onClick={onSave} className="cyber-button-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-300">
        {label}
      </span>
      {children}
    </label>
  );
}

export default AdminPage;
