import { Home, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 text-slate-100">
      <div className="glass-panel max-w-lg rounded-3xl p-10 text-center">
        <SearchX className="mx-auto mb-5 h-16 w-16 text-cyan-300" />
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">404</p>
        <h1 className="mt-3 text-3xl font-black text-white">Page not found</h1>
        <p className="mt-3 text-slate-300">The route you requested does not exist in the demo environment.</p>
        <Link to="/" className="cyber-button-primary mt-6">
          <Home className="mr-2 h-4 w-4" /> Return home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
