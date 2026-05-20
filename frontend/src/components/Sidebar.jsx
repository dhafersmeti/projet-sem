import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, Briefcase, FileText,
  Calendar, LogOut, ClipboardList, Bell, BarChart2,
  UserCircle, Gift, Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import NotificationBell from './NotificationBell'

const STAFF_NAV = [
  { to: '/',             label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/candidates',   label: 'Candidats',        icon: Users           },
  { to: '/job-offers',   label: 'Offres',           icon: Briefcase       },
  { to: '/applications', label: 'Candidatures',     icon: FileText        },
  { to: '/interviews',   label: 'Entretiens',       icon: Calendar        },
  { to: '/reports',      label: 'Rapports',         icon: BarChart2       },
]

const CANDIDATE_NAV = [
  { to: '/portal',                label: 'Mon espace',      icon: LayoutDashboard },
  { to: '/portal/profile',        label: 'Mon profil',      icon: UserCircle      },
  { to: '/portal/application',    label: 'Ma candidature',  icon: ClipboardList   },
  { to: '/portal/interviews',     label: 'Mes entretiens',  icon: Calendar        },
  { to: '/portal/offer',          label: "Offre d'embauche",icon: Gift            },
  { to: '/portal/notifications',  label: 'Notifications',   icon: Bell            },
  { to: '/portal/change-password',label: 'Mot de passe',    icon: Lock            },
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

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 shadow-sm">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-sm">
            <Briefcase className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base leading-none">RecrutApp</p>
            <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">Gestion RH</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
          {isCandidate ? 'Mon portail' : 'Navigation'}
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/' || to === '/portal'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  isActive ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                </span>
                {label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bas de sidebar */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-2">
        {isCandidate && (
          <div className="flex items-center justify-end px-3 pb-1">
            <NotificationBell />
          </div>
        )}

        {/* Profil utilisateur */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-[11px] text-gray-400 truncate capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-4 h-4 text-red-500" />
          </span>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
