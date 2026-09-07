import { ArrowLeft, BookOpen, CheckCircle2, TimerReset } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  'Register your team with team name and player details.',
  'Complete all five levels in order, each with a timer and scoring penalty for mistakes.',
  'Each level uses randomized challenge data drawn from the demo pool.',
  'Level 5 requires ordering the correct response sequence, with an 80% accuracy threshold to pass.',
  'Finishing the challenge updates the same-browser leaderboard and result summary.',
]

function HowToPlayPage() {
  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="cyber-button">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back home
          </Link>
          <span className="level-chip">How it works</span>
        </div>

        <div className="glass-panel rounded-3xl p-8 md:p-10">
          <div className="mb-8 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-cyan-300" />
            <h1 className="text-3xl font-black text-white">How to Play</h1>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {steps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-200">
                    {index + 1}
                  </span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                </div>
                <p className="text-slate-200">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <TimerReset className="mt-1 h-5 w-5 text-amber-300" />
              <div>
                <h3 className="font-semibold text-white">Timing matters</h3>
                <p className="text-sm text-slate-200">Each level has a countdown. Timeout penalties can affect your final ranking.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-300" />
              <div>
                <h3 className="font-semibold text-white">Scoring model</h3>
                <p className="text-sm text-slate-200">Lower total time and fewer mistakes yield a stronger leaderboard position.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link to="/register" className="cyber-button-primary">
              Register Your Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowToPlayPage
