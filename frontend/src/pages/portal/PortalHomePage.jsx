import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import Pipeline from '../../components/Pipeline'
import StatusBadge from '../../components/StatusBadge'
import { candidatePortalApi } from '../../api/candidatePortalApi'
import { useAuth } from '../../context/AuthContext'
import { User, FileText, Calendar, Bell, Gift, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PortalHomePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    candidatePortalApi.getProfile()
      .then(({ data }) => setProfile(data))
      .catch(() => toast.error('Impossible de charger votre profil'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><div className="flex justify-center py-20"><Spinner /></div></Layout>

  const status = profile?.currentStatus
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const shortcuts = [
    { to: '/portal/profile',       label: 'Mon profil',     icon: User,     color: 'bg-indigo-50 text-indigo-600' },
    { to: '/portal/application',   label: 'Ma candidature', icon: FileText, color: 'bg-violet-50 text-violet-600' },
    { to: '/portal/interviews',    label: 'Mes entretiens', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
    { to: '/portal/notifications', label: 'Notifications',  icon: Bell,     color: 'bg-amber-50 text-amber-600' },
    { to: '/portal/offer',         label: 'Mon offre',      icon: Gift,     color: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Bandeau bienvenue */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white shadow-lg">
          <div className="relative z-10">
            <p className="text-sm text-indigo-200">Espace candidat</p>
            <h1 className="text-2xl font-bold mt-1">{greeting}, {profile?.name || user?.name} 👋</h1>
            <p className="text-indigo-200 text-sm mt-1">Suivez l'évolution de votre candidature en temps réel</p>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        </div>

        {/* Statut actuel */}
        {status && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Statut de votre candidature</h2>
              {profile?.targetJobOfferTitle && (
                <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full border">
                  {profile.targetJobOfferTitle}
                </span>
              )}
            </div>
            <Pipeline currentStatus={status} />
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-500">Statut actuel :</span>
              <StatusBadge status={status} />
            </div>
          </div>
        )}

        {/* Accès rapides */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Accès rapides</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {shortcuts.map(({ to, label, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${color} hover:opacity-80 transition-opacity`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Infos profil rapide */}
        {profile && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Mon profil</h2>
              <Link to="/portal/profile" className="text-xs text-indigo-600 flex items-center gap-1 hover:text-indigo-800">
                Modifier <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400">Nom :</span> <span className="font-medium text-gray-800">{profile.name}</span></div>
              <div><span className="text-gray-400">Email :</span> <span className="font-medium text-gray-800">{profile.email}</span></div>
              <div><span className="text-gray-400">Téléphone :</span> <span className="font-medium text-gray-800">{profile.phone || '—'}</span></div>
              <div><span className="text-gray-400">CV :</span> <span className="font-medium text-gray-800">{profile.cvFileName || 'Non fourni'}</span></div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
