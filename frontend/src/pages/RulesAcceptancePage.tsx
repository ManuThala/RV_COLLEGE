import { useEffect, useState, type UIEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import { buildSessionFromTeam } from "../services/gameService";
import {
  getCompetitionSettings,
  getCurrentTeam,
  getSession,
  saveSession,
} from "../services/storageService";

export default function RulesAcceptancePage() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const team = getCurrentTeam();
    if (!team) {
      navigate("/register");
    }
  }, [navigate]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    setScrolledToBottom(isAtBottom);
  };

  const handleAccept = () => {
    if (!accepted) return;

    const team = getCurrentTeam();
    if (!team) {
      navigate("/register");
      return;
    }

    // Resume the same team's already-active session (do not reset the timer / progress).
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

    // The timer for Level 1 starts exactly now, at the moment the team accepts and begins the challenge.
    const session = buildSessionFromTeam(team, existing?.selectedQuestionIds);
    saveSession(session);
    navigate("/challenge");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">
          Competition Rules
        </h1>
        <p className="text-cyan-200 mb-8">
          Please review and accept to proceed
        </p>

        {/* Scrollable Rules Content */}
        <div
          onScroll={handleScroll}
          className="glass-panel mb-8 rounded-xl p-8 max-h-96 overflow-y-auto space-y-6"
        >
          <section>
            <h3 className="text-xl font-bold text-cyan-300 mb-3">
              1. Challenge Overview
            </h3>
            <p className="text-cyan-100/80 mb-3">
              CyberShield: The Cybersecurity Challenge is a timed competition
              testing your cybersecurity knowledge across five levels:
            </p>
            <ul className="list-disc list-inside text-cyan-100/80 space-y-1 ml-2">
              <li>
                <strong>Level 1 (30 seconds):</strong> Identify the strongest
                password
              </li>
              <li>
                <strong>Level 2 (45 seconds):</strong> Solve alphabet/code
                decoding puzzles
              </li>
              <li>
                <strong>Level 3 (45 seconds):</strong> Identify phishing emails
                from an inbox
              </li>
              <li>
                <strong>Level 4 (30 seconds):</strong> Identify suspicious
                files/malware
              </li>
              <li>
                <strong>Level 5 (60 seconds):</strong> Order incident response
                actions correctly (80% accuracy required)
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-cyan-300 mb-3">
              2. Scoring and Timing
            </h3>
            <ul className="list-disc list-inside text-cyan-100/80 space-y-2 ml-2">
              <li>Your score is based on total time across all 5 levels</li>
              <li>An incorrect answer eliminates the team immediately</li>
              <li>If a level times out, the team is eliminated</li>
              <li>
                Leaderboard ranking is determined by fastest total time first
              </li>
              <li>Times are cumulative across completed levels</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-cyan-300 mb-3">
              3. Level Progression
            </h3>
            <ul className="list-disc list-inside text-cyan-100/80 space-y-2 ml-2">
              <li>
                Levels must be completed in order (Level 1 → 2 → 3 → 4 → 5)
              </li>
              <li>You cannot skip or jump to a later level</li>
              <li>Timer starts only when you enter a level</li>
              <li>Incorrect attempts do not reset the timer</li>
              <li>You cannot return to previous levels after advancing</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-cyan-300 mb-3">
              4. Level 5 Special Rules
            </h3>
            <ul className="list-disc list-inside text-cyan-100/80 space-y-2 ml-2">
              <li>
                Level 5 requires you to drag response actions into the correct
                order
              </li>
              <li>
                You must achieve at least 80% accuracy in the sequence to pass
              </li>
              <li>Partial correct sequences may not meet the threshold</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-cyan-300 mb-3">
              5. Data Storage
            </h3>
            <ul className="list-disc list-inside text-cyan-100/80 space-y-2 ml-2">
              <li>
                This is a demo version - all data is stored on this device only
              </li>
              <li>No data is transmitted to external servers</li>
              <li>Clearing browser data will reset all progress</li>
              <li>
                Multi-device real-time leaderboard competition requires backend
                integration
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-cyan-300 mb-3">
              6. Disqualification
            </h3>
            <p className="text-cyan-100/80 mb-3">
              Teams may be disqualified for:
            </p>
            <ul className="list-disc list-inside text-cyan-100/80 space-y-1 ml-2">
              <li>Administrative action via the admin panel</li>
              <li>Intentional circumvention of timer or scoring logic</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-cyan-300 mb-3">
              7. Privacy and Admin
            </h3>
            <ul className="list-disc list-inside text-cyan-100/80 space-y-2 ml-2">
              <li>
                Admins can view team progress, reset scores, and manage the
                competition
              </li>
              <li>Admin access is protected by a PIN</li>
              <li>
                No personal data is retained beyond the competition session
              </li>
            </ul>
          </section>

          <section className="pt-4 border-t border-cyan-500/20">
            <p className="text-sm text-cyan-200 italic">
              By accepting these rules, you confirm you understand the challenge
              format, scoring system, and data handling practices.
            </p>
          </section>
        </div>

        {/* Blocking Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Scroll Status */}
        {!scrolledToBottom && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-200">
              Please scroll to the bottom to accept the rules
            </p>
          </div>
        )}

        {/* Acceptance Checkbox */}
        <div className="glass-panel mb-8 p-6 rounded-xl">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              disabled={!scrolledToBottom}
              className="w-5 h-5 mt-1 rounded border-2 border-cyan-400 accent-cyan-500 cursor-pointer disabled:opacity-50"
            />
            <span className="text-cyan-100">
              I have read and understood the competition rules, scoring system,
              and data handling practices. I accept these terms and am ready to
              start the challenge.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/team-dashboard")}
            className="cyber-button flex-1 py-3 text-base"
          >
            Back
          </button>
          <button
            onClick={handleAccept}
            disabled={!accepted}
            className={`flex-1 py-3 text-base font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              accepted
                ? "cyber-button-primary"
                : "bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Accept & Start Challenge
          </button>
        </div>
      </div>
    </div>
  );
}
