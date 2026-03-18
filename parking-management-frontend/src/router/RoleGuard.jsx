import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

export default function RoleGuard({ roles = [], children, fallback = '/dashboard' }) {
  const hasRole = useAuthStore((s) => s.hasRole)
  const allowed = roles.length === 0 || roles.some((r) => hasRole(r))

  if (!allowed) {
    return <Navigate to={fallback} replace />
  }

  return children
}
