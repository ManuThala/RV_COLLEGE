import { useState, type ReactNode } from 'react'
import { Lock, LogOut } from 'lucide-react'
import { getDemoPin, isAdminAuthed, setAdminAuthed } from '../services/storageService'

interface AdminRouteGuardProps {
  children: (props: { onLogout: () => void }) => ReactNode
}

// Gate for admin-only views. Auth is remembered in sessionStorage for the tab session
// (survives a refresh of /admin, cleared when the tab closes or Logout is clicked) —
// this is what stands in for a backend session in a frontend-only/localStorage app.
export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const [pin, setPin] = useState('')
  const [authorized, setAuthorized] = useState(() => isAdminAuthed())
  const [message, setMessage] = useState('')

  const handleUnlock = () => {
    if (pin === getDemoPin()) {
      setAdminAuthed(true)
      setAuthorized(true)
      setMessage('')
      return
    }
    setMessage('Incorrect demo PIN.')
  }

  const handleLogout = () => {
    setAdminAuthed(false)
    setAuthorized(false)
    setPin('')
  }

  if (!authorized) {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800/70 p-6">
        <div className="flex items-center gap-3">
          <Lock className="h-6 w-6 text-cyan-300" />
          <span className="text-sm font-medium text-slate-200">Admin access requires the demo PIN</span>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Demo PIN</span>
          <input
            type="password"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleUnlock()}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            placeholder="Enter PIN"
          />
        </label>
        <button onClick={handleUnlock} className="cyber-button-primary">
          Unlock Console
        </button>
        {message && <p className="text-sm text-red-300">{message}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button onClick={handleLogout} className="cyber-button flex items-center gap-2 text-sm">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
      {children({ onLogout: handleLogout })}
    </div>
  )
}
