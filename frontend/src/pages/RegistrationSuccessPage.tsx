import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Copy } from 'lucide-react'
import { getCurrentTeam } from '../services/storageService'
import type { Team } from '../types'

export default function RegistrationSuccessPage() {
  const navigate = useNavigate()
  const [team, setTeam] = useState<Team | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const currentTeam = getCurrentTeam()
    if (!currentTeam) {
      navigate('/register')
      return
    }
    setTeam(currentTeam)
  }, [navigate])

  const handleCopyTeamId = () => {
    if (team?.id) {
      navigator.clipboard.writeText(team.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleProceed = () => {
    navigate('/team-dashboard')
  }

  if (!team) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Success Banner */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
              <Check className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Registration Complete!</h1>
          <p className="text-cyan-200 text-lg">Your team is ready for the challenge</p>
        </div>

        {/* Team Info Card */}
        <div className="glass-panel mb-8 p-8 rounded-xl space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">Team Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-cyan-100/70 mb-1">Team Name</p>
                <p className="text-lg font-semibold text-white">{team.name}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-cyan-100/70 mb-1">Player 1</p>
                  <p className="text-base text-white">{team.player1}</p>
                </div>
                <div>
                  <p className="text-sm text-cyan-100/70 mb-1">Player 2</p>
                  <p className="text-base text-white">{team.player2}</p>
                </div>
              </div>
              {(team.college || team.className || team.department) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-cyan-500/20">
                  {team.college && (
                    <div>
                      <p className="text-sm text-cyan-100/70 mb-1">College</p>
                      <p className="text-sm text-white">{team.college}</p>
                    </div>
                  )}
                  {team.className && (
                    <div>
                      <p className="text-sm text-cyan-100/70 mb-1">Class</p>
                      <p className="text-sm text-white">{team.className}</p>
                    </div>
                  )}
                  {team.department && (
                    <div>
                      <p className="text-sm text-cyan-100/70 mb-1">Department</p>
                      <p className="text-sm text-white">{team.department}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Team ID */}
          <div className="pt-6 border-t border-cyan-500/20">
            <p className="text-sm text-cyan-100/70 mb-2">Unique Team ID</p>
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-3 border border-cyan-500/30">
              <code className="flex-1 text-sm font-mono text-cyan-300 break-all">{team.id}</code>
              <button
                onClick={handleCopyTeamId}
                className="p-2 hover:bg-cyan-500/20 rounded transition-colors"
                title="Copy Team ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-cyan-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-cyan-100/60 mt-2">Save this ID - you may need it for competition tracking</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="glass-panel mb-8 p-6 rounded-xl border-l-4 border-l-blue-500">
          <h3 className="font-semibold text-blue-200 mb-2">Next Steps</h3>
          <ul className="text-sm text-cyan-100/80 space-y-1 list-disc list-inside">
            <li>Review the team dashboard with competition timeline</li>
            <li>Accept the competition rules and terms</li>
            <li>Start the challenge when ready</li>
            <li>Complete all 5 levels in order</li>
          </ul>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleProceed}
          className="cyber-button-primary w-full py-4 text-lg"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  )
}
