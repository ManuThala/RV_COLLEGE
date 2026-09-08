import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Shield, Trophy, AlertCircle } from "lucide-react";
import {
  buildSessionFromTeam,
  LEVEL_DEFINITIONS,
} from "../services/gameService";
import {
  getCompetitionSettings,
  getCurrentTeam,
  getSession,
  saveSession,
} from "../services/storageService";
import type { Team } from "../types";

export default function TeamDashboardPage() {
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentTeam = getCurrentTeam();
    if (!currentTeam) {
      navigate("/register");
      return;
    }
    setTeam(currentTeam);
  }, [navigate]);

  const handleStartChallenge = () => {
    if (!team) return;

    const existing = getSession();
    if (
      existing &&
      existing.completionStatus === "in_progress" &&
      !existing.disqualified
    ) {
      if (existing.teamId === team.id) {
        navigate("/challenge");
        return;
      }
      setError(
        `Team "${existing.teamName}" already has an active session on this device. Please wait for it to finish or ask an admin to reset it before starting a new challenge.`,
      );
      return;
    }

    const competitionSettings = getCompetitionSettings();
    if (competitionSettings.ended) {
      setError("The competition has ended. New challenges cannot be started.");
      return;
    }
    if (!competitionSettings.started) {
      setError(
        "The competition has not started yet. Please wait for the organizer to begin.",
      );
      return;
    }

    const session = buildSessionFromTeam(
      team,
      existing?.lastQuizCombinationUsed,
    );
    saveSession(session);
    navigate("/challenge");
  };

  if (!team) return null;

  const levelDefinitions = LEVEL_DEFINITIONS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Team Dashboard</h1>
          <p className="text-cyan-200">Welcome, {team.name}!</p>
        </div>

        {/* Team Summary */}
        <div className="glass-panel mb-8 p-6 rounded-xl">
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-cyan-500/20">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {team.name}
              </h2>
              <div className="flex gap-4 text-sm text-cyan-200">
                <span>
                  {team.player1} & {team.player2}
                </span>
                {team.college && (
                  <span className="text-cyan-300/70">• {team.college}</span>
                )}
              </div>
            </div>
            <Shield className="w-10 h-10 text-cyan-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-cyan-100/60 uppercase tracking-wide mb-2">
                Team ID
              </p>
              <p className="text-lg font-mono text-cyan-300 break-all">
                {team.id}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-cyan-100/60 uppercase tracking-wide mb-2">
                Status
              </p>
              <p className="text-lg text-green-400 font-semibold">Ready</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-cyan-100/60 uppercase tracking-wide mb-2">
                Created
              </p>
              <p className="text-lg text-cyan-300">
                {new Date(team.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Challenge Timeline */}
        <div className="glass-panel mb-8 p-8 rounded-xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Challenge Timeline
          </h3>

          <div className="space-y-4">
            {levelDefinitions.map((level, idx) => (
              <div key={level.id} className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg flex-shrink-0">
                  {level.id}
                </div>
                <div className="flex-1 bg-slate-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-1">
                    {level.name}
                  </h4>
                  <p className="text-sm text-cyan-200/80 mb-3">
                    {level.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-cyan-300/70">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {level.timer}s time limit
                    </span>
                    {idx === 4 && (
                      <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                        80% accuracy required
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="glass-panel mb-8 p-6 rounded-xl border-l-4 border-l-amber-500">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-200 mb-2">
                Important Notes
              </h4>
              <ul className="text-sm text-cyan-100/80 space-y-1 list-disc list-inside">
                <li>Levels must be completed in order (1 → 2 → 3 → 4 → 5)</li>
                <li>Each level starts only when you click "Start Challenge"</li>
                <li>Timer starts immediately after the level opens</li>
                <li>Leaderboard is ranked by total time (fastest first)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="cyber-button flex-1 py-3 text-base"
          >
            Back to Home
          </button>
          <div className="flex flex-1 flex-col gap-2">
            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}
            <button
              onClick={handleStartChallenge}
              className="cyber-button-primary w-full py-3 text-base"
            >
              Start Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
