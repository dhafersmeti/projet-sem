import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Calendar,
  LogOut,
  UserCircle,
  ClipboardList
} from 'lucide-react'
import toast from 'react-hot-toast'

const STAFF_NAV = [
  { to: '/',             label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/candidates',   label: 'Candidats',        icon: Users           },
  { to: '/job-offers',   label: 'Offres',           icon: Briefcase       },
  { to: '/applications', label: 'Candidatures',     icon: FileText        },
  { to: '/interviews',   label: 'Entretiens',       icon: Calendar        },
]

const CANDIDATE_NAV = [
  { to: '/portal',       label: 'Mon espace',       icon: LayoutDashboard },
  { to: '/portal/applications', label: 'Mes candidatures', icon: ClipboardList },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isCandidate = user?.role === 'CANDIDATE'
  const NAV_ITEMS = isCandidate ? CANDIDATE_NAV : STAFF_NAV

  const handleLogout = () => {
    logout()
    toast.success('Déconnexion réussie')
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">RecrutApp</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Utilisateur connecté */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
