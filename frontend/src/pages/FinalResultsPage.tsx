import { CheckCircle2, Clock3, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { getLeaderboard, getSession } from "../services/storageService";

function FinalResultsPage() {
  const session = getSession();
  const leaderboard = getLeaderboard();

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8 text-slate-100">
        <div className="glass-panel rounded-3xl p-8 text-center">
          <p className="text-xl font-bold text-white">
            No active session found.
          </p>
          <Link to="/register" className="cyber-button-primary mt-5">
            Create a team
          </Link>
        </div>
      </div>
    );
  }

  const total = Object.values(session.levelResults).reduce(
    (sum, item) => sum + item.totalTime,
    0,
  );
  const rank =
    leaderboard.findIndex((entry) => entry.teamId === session.teamId) + 1;

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="glass-panel rounded-3xl p-8 md:p-10">
          <div className="mb-8 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-300" />
            <h1 className="text-3xl font-black text-white">
              Challenge Complete
            </h1>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                Team
              </p>
              <p className="mt-3 text-2xl font-bold text-white">
                {session.teamName}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Total time
              </p>
              <p className="mt-3 text-2xl font-bold text-white">{total}s</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Leaderboard rank
              </p>
              <p className="mt-3 text-2xl font-bold text-white">
                #{rank || "—"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <div className="flex items-center gap-3 text-emerald-200">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-semibold text-white">
                Your team successfully defended the environment.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {Object.values(session.levelResults).map((result) => {
              return (
                <div
                  key={result.level}
                  className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{result.label}</p>
                    <span className="rounded-full border border-slate-600 px-2 py-1 text-xs uppercase tracking-[0.15em] text-slate-200">
                      {result.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4" /> {result.totalTime}s
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-2">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">
                        Wrong Attempts
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {result.incorrectAttempts}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    {result.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/leaderboard" className="cyber-button-primary">
              View Leaderboard
            </Link>
            <Link to="/register" className="cyber-button">
              Play Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinalResultsPage;
