import { clearSession, getLeaderboard, getSession, saveLeaderboard, saveSession } from './storageService'
import type { GameSession, LeaderboardEntry } from '../types'

export const buildLeaderboardEntry = (session: GameSession): LeaderboardEntry => {
  const completedAt = session.completionStatus === 'completed' ? new Date().toISOString() : null
  const totalTime = session.totalTime || Object.values(session.levelResults).reduce((sum, item) => sum + item.totalTime, 0)
  const penalties = Object.values(session.penalties || {}).reduce((sum, val) => sum + (val ?? 0), 0)
  const incorrectAttempts = Object.values(session.incorrectAttempts || {}).reduce((sum, val) => sum + (val ?? 0), 0)
  const levelTimes: Record<number, number> = {}
  for (let level = 1; level <= 5; level += 1) {
    levelTimes[level] = session.levelResults[level]?.totalTime ?? session.levelCompletionTimes[level] ?? 0
  }

  const status: LeaderboardEntry['status'] = session.disqualified
    ? 'disqualified'
    : session.completionStatus === 'completed'
      ? 'completed'
      : 'playing'

  return {
    id: session.id,
    teamId: session.teamId,
    teamName: session.teamName,
    players: `${session.player1}, ${session.player2}`,
    currentLevel: session.currentLevel,
    levelTimes,
    level1Time: levelTimes[1] || undefined,
    level2Time: levelTimes[2] || undefined,
    level3Time: levelTimes[3] || undefined,
    level4Time: levelTimes[4] || undefined,
    level5Time: levelTimes[5] || undefined,
    penalties,
    totalTime,
    incorrectAttempts,
    status,
    completedAt,
    createdAt: new Date(session.gameStartTimestamp).toISOString(),
  }
}

export const upsertLeaderboard = (session: GameSession) => {
  const entries = getLeaderboard()
  const entry = buildLeaderboardEntry(session)
  const filtered = entries.filter((item) => item.teamId !== session.teamId)
  filtered.push(entry)
  const sorted = filtered.sort((a, b) => {
    if (a.totalTime !== b.totalTime) return a.totalTime - b.totalTime
    if (a.incorrectAttempts !== b.incorrectAttempts) return a.incorrectAttempts - b.incorrectAttempts
    if (a.penalties !== b.penalties) return a.penalties - b.penalties
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
  saveLeaderboard(sorted)
}

export const getRankingLabel = (rank: number) => {
  if (rank === 1) return '🏆'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `${rank}`
}

export const setTeamDisqualified = (teamId: string, disqualified: boolean) => {
  const entries = getLeaderboard()
  const updated = entries.map((entry) =>
    entry.teamId === teamId
      ? { ...entry, status: disqualified ? ('disqualified' as const) : entry.completedAt ? ('completed' as const) : ('playing' as const) }
      : entry,
  )
  saveLeaderboard(updated)

  const session = getSession()
  if (session && session.teamId === teamId) {
    saveSession({ ...session, disqualified })
  }
}

export const resetTeamProgress = (teamId: string) => {
  const entries = getLeaderboard().filter((entry) => entry.teamId !== teamId)
  saveLeaderboard(entries)

  const session = getSession()
  if (session && session.teamId === teamId) {
    clearSession()
  }
}
