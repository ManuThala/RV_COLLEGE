import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Shield, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { MAX_LEVEL } from "../services/gameService";
import {
  getCompetitionSettings,
  getCurrentTeam,
  getSession,
  saveTeam,
  saveCompetitionSettings,
  setCurrentTeam,
} from "../services/storageService";
import type { Team } from "../types";

function RegisterPage() {
  const navigate = useNavigate();
  const existingTeam = getCurrentTeam();
  const activeSession = getSession();
  const [competitionSettings, setCompetitionSettings] = useState(
    getCompetitionSettings,
  );

  // Prevent a team from creating a second active session while one is already in progress on this device.
  const blockingSession =
    activeSession &&
    activeSession.completionStatus === "in_progress" &&
    !activeSession.disqualified &&
    activeSession.teamId !== existingTeam?.id
      ? activeSession
      : null;

  const [form, setForm] = useState<Team>(
    existingTeam ?? {
      id: `TEAM-${Date.now()}`,
      name: "",
      player1: "",
      player2: "",
      createdAt: new Date().toISOString(),
    },
  );
  const [error, setError] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
    fetch(`${apiUrl}/competition/settings`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Competition status unavailable.");
        const result = (await response.json()) as {
          success?: boolean;
          settings?: typeof competitionSettings;
        };
        if (result.success && result.settings) {
          setCompetitionSettings(result.settings);
          saveCompetitionSettings(result.settings);
        }
      })
      .catch(() => {
        // Use cached settings when the backend is temporarily unavailable.
      });
  }, []);

  const handleChange = (field: keyof Team, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (blockingSession) {
      setError(
        `Team "${blockingSession.teamName}" already has an active session on this device. Finish or ask an admin to reset it first.`,
      );
      return;
    }

    if (competitionSettings.ended) {
      setError("The competition has ended. New registrations are closed.");
      return;
    }

    if (!competitionSettings.started) {
      setError(
        "The competition has not started yet. Please wait for the organizer to begin.",
      );
      return;
    }

    const name = form.name.trim();
    const player1 = form.player1.trim();
    const player2 = form.player2.trim();

    const missingFields: string[] = [];
    if (!name) missingFields.push("Team name");
    if (!player1) missingFields.push("Player 1");
    if (!player2) missingFields.push("Player 2");

    if (missingFields.length > 0) {
      setAttemptedSubmit(true);
      setError(
        `Please fill in the following required field(s): ${missingFields.join(", ")}.`,
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, player1, player2 }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        team?: {
          _id: string;
          createdAt: string;
          name: string;
          player1: string;
          player2: string;
        };
      };

      if (!response.ok || !result.success || !result.team) {
        throw new Error(result.message ?? "Team registration failed.");
      }

      const team: Team = {
        id: result.team._id,
        name: result.team.name,
        player1: result.team.player1,
        player2: result.team.player2,
        createdAt: result.team.createdAt,
      };
      saveTeam(team);
      setCurrentTeam(team);
      navigate("/registration-success");
    } catch (submitError) {
      setError(
        submitError instanceof TypeError
          ? "Unable to reach the backend. Start the backend server and try again."
          : submitError instanceof Error
            ? submitError.message
            : "Team registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="cyber-button">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back home
          </Link>
          <span className="level-chip">Registration</span>
        </div>

        <div className="glass-panel rounded-3xl p-8 md:p-10">
          <div className="mb-8 flex items-center gap-3">
            <Shield className="h-8 w-8 text-cyan-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Team Setup
              </p>
              <h1 className="text-3xl font-black text-white">
                Create your defense squad
              </h1>
            </div>
          </div>

          {blockingSession && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">
                  An active session is already in progress on this device.
                </p>
                <p className="mt-1 text-amber-100/80">
                  Team "{blockingSession.teamName}" is currently playing. Please
                  wait for them to finish, or ask an admin to reset the session,
                  before registering a new team.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/challenge")}
                  className="mt-3 rounded-lg border border-amber-300/40 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-200 hover:bg-amber-200/10"
                >
                  Resume {blockingSession.teamName}'s session
                </button>
              </div>
            </div>
          )}

          {!blockingSession && competitionSettings.ended && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p>The competition has ended. New registrations are closed.</p>
            </div>
          )}

          {!blockingSession &&
            !competitionSettings.ended &&
            !competitionSettings.started && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <p>
                  The competition has not started yet. Please wait for the
                  organizer to begin.
                </p>
              </div>
            )}

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <fieldset
              disabled={Boolean(blockingSession) || isSubmitting}
              className="contents"
            >
              <label className="md:col-span-2 block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Team name *
                </span>
                <input
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className={`w-full rounded-xl border bg-slate-950/60 px-4 py-3 text-white outline-none ring-0 transition focus:border-cyan-400 ${attemptedSubmit && !form.name.trim() ? "border-red-500" : "border-slate-700"}`}
                  placeholder="Night Shift Security"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Player 1 *
                </span>
                <input
                  value={form.player1}
                  onChange={(event) =>
                    handleChange("player1", event.target.value)
                  }
                  className={`w-full rounded-xl border bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400 ${attemptedSubmit && !form.player1.trim() ? "border-red-500" : "border-slate-700"}`}
                  placeholder="Player One"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Player 2 *
                </span>
                <input
                  value={form.player2}
                  onChange={(event) =>
                    handleChange("player2", event.target.value)
                  }
                  className={`w-full rounded-xl border bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400 ${attemptedSubmit && !form.player2.trim() ? "border-red-500" : "border-slate-700"}`}
                  placeholder="Player Two"
                />
              </label>

              {error && (
                <p className="md:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </p>
              )}

              <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-cyan-100">
                <div className="flex items-center gap-3">
                  <UserRound className="h-5 w-5" />
                  <span>
                    {MAX_LEVEL} levels · randomized cybersecurity challenges
                  </span>
                </div>
                <button
                  type="submit"
                  className="cyber-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Registering..." : "Continue to Dashboard"}
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
