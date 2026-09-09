import {
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  XCircle,
} from "lucide-react";
import type { LevelResult } from "../types";

interface LevelResultScreenProps {
  result: LevelResult;
  onContinue: () => void;
}

export default function LevelResultScreen({
  result,
  onContinue,
}: LevelResultScreenProps) {
  const isSuccess = result.status === "completed";
  const isTimeout = result.status === "timeout";
  const isEliminated = result.status === "failed";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-panel rounded-xl max-w-2xl w-full p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {isSuccess ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-green-400">
                  Level Complete!
                </h2>
                <p className="text-green-300/80">{result.label}</p>
              </div>
            </>
          ) : isEliminated ? (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-red-400">
                  Team Eliminated
                </h2>
                <p className="text-red-300/80">{result.label}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-amber-400">
                  {isTimeout ? "Time's Up!" : "Level Result"}
                </h2>
                <p className="text-amber-300/80">{result.label}</p>
              </div>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
            <p className="text-xs text-cyan-100/60 uppercase tracking-wide mb-2">
              Actual Time
            </p>
            <p className="text-2xl font-bold text-cyan-300">
              {result.actualTime}s
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/20">
            <p className="text-xs text-red-100/60 uppercase tracking-wide mb-2">
              Mistakes
            </p>
            <p className="text-2xl font-bold text-red-300">
              {result.incorrectAttempts}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
            <p className="text-xs text-purple-100/60 uppercase tracking-wide mb-2">
              Total Time
            </p>
            <p className="text-2xl font-bold text-purple-300">
              {result.totalTime}s
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/20">
          <h3 className="font-semibold text-blue-300 mb-2">Explanation</h3>
          <p className="text-sm text-blue-100/80 leading-relaxed">
            {result.explanation}
          </p>
        </div>

        {/* Tip */}
        {result.tip && (
          <div className="bg-green-950/50 rounded-lg p-4 border border-green-500/30 flex gap-3">
            <Lightbulb className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-300 mb-1">
                Cybersecurity Tip
              </h4>
              <p className="text-sm text-green-100/80">{result.tip}</p>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="cyber-button-primary w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          <span>
            {isEliminated ? "Exit to Leaderboard" : "Continue to Next Level"}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
