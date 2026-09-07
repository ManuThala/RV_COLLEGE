import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, Trophy } from 'lucide-react'
import { getWinner } from '../services/storageService'
import type { Winner } from '../types'

function WinnerPage() {
  const [winner, setWinner] = useState<Winner | null>(() => getWinner())

  useEffect(() => {
    const interval = window.setInterval(() => setWinner(getWinner()), 3000)
    return () => window.clearInterval(interval)
  }, [])

  if (!winner || !winner.confirmed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 text-slate-100">
        <div className="glass-panel rounded-3xl p-10 text-center">
          <Trophy className="mx-auto mb-4 h-12 w-12 text-slate-500" />
          <h1 className="text-2xl font-bold text-white">Winner not yet announced</h1>
          <p className="mt-2 text-slate-400">Check back once the competition organizer confirms the result.</p>
          <Link to="/" className="cyber-button mt-6 inline-block">Back home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.15),transparent_60%)]" />
      <div className="glass-panel relative z-10 max-w-2xl rounded-3xl p-10 text-center md:p-16">
        <Crown className="mx-auto mb-6 h-16 w-16 text-yellow-300" />
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">CyberShield Champion</p>
        <h1 className="mt-4 text-5xl font-black text-white md:text-6xl">{winner.teamName}</h1>
        <p className="mt-4 text-xl text-cyan-200">{winner.players}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-yellow-200">Rank</p>
            <p className="mt-1 text-3xl font-bold text-yellow-300">#{winner.rank}</p>
          </div>
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Total Time</p>
            <p className="mt-1 text-3xl font-bold text-cyan-300">{winner.totalTime}s</p>
          </div>
        </div>
        <p className="mt-8 text-sm text-slate-400">Announced {new Date(winner.selectedAt).toLocaleString()}</p>
      </div>
    </div>
  )
}

export default WinnerPage
