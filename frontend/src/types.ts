export type LevelDefinition = {
  id: number
  name: string
  timer: number
  description: string
}

export type QuestionOption = {
  id: string
  text: string
}

export type Question = {
  id: string
  question: string
  options: QuestionOption[]
  correctOptionId: string
  explanation: string
  tip: string
  difficulty: string
  active: boolean
}

export type Level2Question = {
  id: string
  question: string
  options: string[]
  correctOption: string
  explanation: string
  difficulty: string
  active: boolean
}

export type PhishingEmail = {
  id: string
  senderName: string
  senderEmail: string
  subject: string
  dateTime: string
  body: string
  link?: string
  attachment?: string
  suspicious: boolean
  reasons: string[]
}

export type PhishingRound = {
  id: string
  title: string
  emails: PhishingEmail[]
  correctEmailId: string
  explanation: string
  active: boolean
}

export type MalwareFile = {
  id: string
  name: string
  extension: string
  type: string
  size: string
  modified: string
  source?: string
  suspicious: boolean
  reasons: string[]
}

export type MalwareRound = {
  id: string
  title: string
  files: MalwareFile[]
  correctFileId: string
  explanation: string
  active: boolean
}

export type ResponseAction = {
  id: string
  text: string
  category?: string
}

export type IncidentScenario = {
  id: string
  category: string
  title: string
  description: string
  actions: ResponseAction[]
  correctActionIds: string[]
  correctSequence: string[]
  explanation: string
  difficulty: string
  active: boolean
}

export type Team = {
  id: string
  name: string
  player1: string
  player2: string
  college?: string
  className?: string
  department?: string
  createdAt: string
}

export type LevelResult = {
  level: number
  label: string
  actualTime: number
  incorrectAttempts: number
  penaltySeconds: number
  totalTime: number
  status: 'completed' | 'timeout' | 'failed'
  explanation: string
  tip: string
  completedAt: string
}

export type GameSession = {
  id: string
  teamId: string
  teamName: string
  player1: string
  player2: string
  selectedQuestionIds: Record<number, string>
  currentLevel: number
  gameStartTimestamp: number
  levelStartTimestamp: number | null
  answerSubmissions: Record<number, string[]>
  incorrectAttempts: Record<number, number>
  penalties: Record<number, number>
  levelCompletionTimes: Record<number, number>
  totalTime: number
  completionStatus: 'not_started' | 'in_progress' | 'completed' | 'timed_out'
  lastQuizCombinationUsed: string
  levelResults: Record<number, LevelResult>
  currentLevelLocked: boolean
  disqualified?: boolean
  timeoutPenaltyApplied?: Record<number, boolean>
  currentTimeoutMessage?: string
  challengeStartedAt: number | null
  displayOrder: Record<number, string[]>
  rejectedOptions: Record<number, string[]>
}

export type LeaderboardEntry = {
  id: string
  teamId: string
  teamName: string
  players: string
  currentLevel: number
  levelTimes: Record<number, number>
  level1Time?: number
  level2Time?: number
  level3Time?: number
  level4Time?: number
  level5Time?: number
  penalties: number
  totalTime: number
  incorrectAttempts: number
  status: 'completed' | 'playing' | 'paused' | 'disqualified'
  completedAt: string | null
  createdAt: string
}

export type AdminStats = {
  totalTeams: number
  currentlyPlaying: number
  completedTeams: number
  disqualifiedTeams: number
}

export type CompetitionSettings = {
  started: boolean
  ended: boolean
  startedAt: string | null
  endedAt: string | null
  liveMode: boolean
}

export type QuestionOverrides = Record<string, boolean>

export type QuizSetLevelKey = 'level1QuestionId' | 'level2QuestionId' | 'level3RoundId' | 'level4RoundId' | 'level5ScenarioId'

export type QuizSetOverrides = Record<string, Partial<Record<QuizSetLevelKey, string>>>

export type Winner = {
  teamId: string
  teamName: string
  players: string
  totalTime: number
  rank: number
  selectedAt: string
  confirmed: boolean
}

export type QuestionStat = {
  shown: number
  correct: number
  incorrect: number
}
