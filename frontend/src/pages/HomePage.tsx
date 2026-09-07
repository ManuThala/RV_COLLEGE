import { ArrowRight, ShieldCheck, Swords, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                CyberShield
              </p>
              <h1 className="text-lg font-semibold text-white">
                The Cybersecurity Challenge
              </h1>
            </div>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm text-slate-200">
            <Link to="/how-to-play" className="cyber-button">
              How to Play
            </Link>
            <Link to="/leaderboard" className="cyber-button">
              Leaderboard
            </Link>
            <Link to="/admin" className="cyber-button">
              Admin
            </Link>
          </nav>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <section className="glass-panel rounded-3xl p-8 md:p-10">
            <h2 className="mb-5 text-4xl font-black tracking-tight text-white md:text-6xl">
              Defend the network.
              <br />
              <span className="text-gradient">Outthink the attacker.</span>
            </h2>
            <p className="max-w-xl text-lg text-slate-300">
              Join a fast-paced five-level cyber challenge that tests password
              security, code-breaking, phishing detection, malware
              investigation, and critical incident response.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="cyber-button-primary">
                Start Challenge <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/rules" className="cyber-button">
                Review Rules
              </Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
                <ShieldCheck className="mb-3 h-8 w-8 text-cyan-300" />
                <h3 className="font-semibold text-white">5 levels</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Timed, randomized, and progressive.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
                <Swords className="mb-3 h-8 w-8 text-emerald-300" />
                <h3 className="font-semibold text-white">Live scoring</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Faster runs and fewer mistakes rank higher.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
                <Trophy className="mb-3 h-8 w-8 text-yellow-300" />
                <h3 className="font-semibold text-white">Local leaderboard</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Ranked on this device for demo use.
                </p>
              </div>
            </div>
          </section>

          <aside className="glass-panel rounded-3xl p-8">
            <h3 className="mb-4 text-xl font-bold text-white">
              Challenge Snapshot
            </h3>
            <ul className="space-y-4 text-slate-200">
              <li className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                  Level 1
                </p>
                <p className="mt-2 font-semibold text-white">
                  Strongest Password
                </p>
              </li>
              <li className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                  Level 2
                </p>
                <p className="mt-2 font-semibold text-white">Coding-Decoding</p>
              </li>
              <li className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                  Level 3
                </p>
                <p className="mt-2 font-semibold text-white">
                  Phishing Detection
                </p>
              </li>
              <li className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                  Level 4
                </p>
                <p className="mt-2 font-semibold text-white">Malware Hunt</p>
              </li>
              <li className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                  Level 5
                </p>
                <p className="mt-2 font-semibold text-white">
                  Incident Response
                </p>
              </li>
            </ul>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default HomePage;
