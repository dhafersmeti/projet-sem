import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Rediriger vers le bon espace selon le rôle
    return <Navigate to={user?.role === 'CANDIDATE' ? '/portal' : '/'} replace />
  }

  return children
}
