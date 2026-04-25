import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-7xl font-semibold text-gradient mb-4">404</p>
        <p className="text-surface-400 text-sm mb-6">Page not found</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to dashboard</button>
      </div>
    </div>
  )
}
