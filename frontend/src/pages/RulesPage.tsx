import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { Link } from "react-router-dom";

const levels = [
  "Level 1: Strongest Password — select the strongest password option.",
  "Level 2: Coding-Decoding — solve the alphabet or code-based logic puzzle.",
  "Level 3: Phishing Detection — identify the legitimate email from suspicious options.",
  "Level 4: Malware Hunt — detect the malicious file before it runs.",
  "Level 5: Respond to the Cyber Attack — arrange the most effective response sequence.",
];

function RulesPage() {
  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="cyber-button">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back home
          </Link>
          <span className="level-chip">Rules</span>
        </div>

        <div className="glass-panel rounded-3xl p-8 md:p-10">
          <div className="mb-8 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-cyan-300" />
            <h1 className="text-3xl font-black text-white">
              Competition Rules
            </h1>
          </div>

          <div className="space-y-4">
            {levels.map((level) => (
              <div
                key={level}
                className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 text-slate-200"
              >
                {level}
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-amber-200">
                <TimerReset className="h-5 w-5" />
                <h3 className="font-semibold text-white">Timer penalties</h3>
              </div>
              <p className="text-sm text-slate-200">
                Every incorrect attempt adds penalty time. If the timer expires,
                the team is eliminated.
              </p>
            </div>
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-red-200">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-semibold text-white">Level 5 threshold</h3>
              </div>
              <p className="text-sm text-slate-200">
                The correct incident-response sequence must meet the required
                accuracy threshold to pass.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
            Demo version: Data is stored on this device. Multi-device real-time
            competition requires backend integration.
          </div>

          <div className="mt-8 text-center">
            <Link to="/register" className="cyber-button-primary">
              Proceed to Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RulesPage;
