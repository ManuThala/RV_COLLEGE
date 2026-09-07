import { useMemo, useState } from 'react'
import { ArrowLeft, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getRankingLabel } from '../services/leaderboardService'
import { getLeaderboard } from '../services/storageService'
import type { LeaderboardEntry } from '../types'

type FilterKey = 'all' | 'completed' | 'playing'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All Teams' },
  { key: 'completed', label: 'Completed Teams' },
  { key: 'playing', label: 'Currently Playing' },
]

const statusBadgeClass = (status: LeaderboardEntry['status']) => {
  if (status === 'completed') return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
  if (status === 'disqualified') return 'bg-red-500/20 text-red-200 border-red-500/30'
  return 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30'
}

function LeaderboardPage() {
  const [filter, setFilter] = useState<FilterKey>('all')

  const leaderboard = useMemo(
    () =>
      getLeaderboard().sort((a, b) => {
        if (a.totalTime !== b.totalTime) return a.totalTime - b.totalTime
        if (a.incorrectAttempts !== b.incorrectAttempts) return a.incorrectAttempts - b.incorrectAttempts
        return a.penalties - b.penalties
      }),
    [],
  )

  const filtered = leaderboard.filter((entry) => {
    if (filter === 'completed') return entry.status === 'completed'
    if (filter === 'playing') return entry.status === 'playing'
    return true
  })

  const counts = {
    all: leaderboard.length,
    completed: leaderboard.filter((e) => e.status === 'completed').length,
    playing: leaderboard.filter((e) => e.status === 'playing').length,
  }

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="cyber-button">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back home
          </Link>
          <span className="level-chip">Leaderboard</span>
        </div>

        <div className="glass-panel rounded-3xl p-8 md:p-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-300" />
              <h1 className="text-3xl font-black text-white">Demo Leaderboard</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    filter === item.key
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                      : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {item.label} <span className="ml-1 text-xs opacity-70">({counts[item.key]})</span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 text-slate-300">
              No teams match this filter yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-700">
              <table className="w-full min-w-[1100px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-800/80 text-left text-xs uppercase tracking-[0.15em] text-slate-400">
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Players</th>
                    <th className="px-4 py-3 text-center">Current Level</th>
                    <th className="px-4 py-3 text-right">L1</th>
                    <th className="px-4 py-3 text-right">L2</th>
                    <th className="px-4 py-3 text-right">L3</th>
                    <th className="px-4 py-3 text-right">L4</th>
                    <th className="px-4 py-3 text-right">L5</th>
                    <th className="px-4 py-3 text-right">Penalties</th>
                    <th className="px-4 py-3 text-right">Total Time</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry, index) => (
                    <tr key={entry.id} className="border-t border-slate-800 bg-slate-900/40 hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-cyan-300">{getRankingLabel(index + 1)}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{entry.teamName}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{entry.players}</td>
                      <td className="px-4 py-3 text-center text-slate-200">{entry.currentLevel} / 5</td>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <td key={level} className="px-4 py-3 text-right text-slate-300">
                          {entry.levelTimes?.[level] ? `${entry.levelTimes[level]}s` : '—'}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right text-orange-300">{entry.penalties}s</td>
                      <td className="px-4 py-3 text-right font-bold text-white">{entry.totalTime}s</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${statusBadgeClass(entry.status)}`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage
