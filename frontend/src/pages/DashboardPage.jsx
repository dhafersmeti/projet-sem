import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import { dashboardApi } from '../api/dashboardApi'
import { useAuth } from '../context/AuthContext'
import {
  Users, Briefcase, TrendingUp, CheckCircle,
  Clock, Calendar, XCircle, ArrowRight, Plus
} from 'lucide-react'
import toast from 'react-hot-toast'

function StatCard({ title, value, icon: Icon, gradient, sub }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-md ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-4xl font-bold mt-2 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-white/70 mt-1">{sub}</p>}
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
    </div>
  )
}

function PipelineBar({ byStatus = {} }) {
  const segments = [
    { key: 'RECEIVED',     label: 'Reçu',          color: 'bg-sky-400'     },
    { key: 'UNDER_REVIEW', label: 'En examen',      color: 'bg-amber-400'   },
    { key: 'INTERVIEW',    label: 'Entretien',      color: 'bg-blue-500'    },
    { key: 'EVALUATION',   label: 'Évaluation',     color: 'bg-violet-500'  },
    { key: 'ACCEPTED',     label: 'Accepté',        color: 'bg-emerald-500' },
    { key: 'REJECTED',     label: 'Refusé',         color: 'bg-red-400'     },
  ].map(s => ({ ...s, count: byStatus[s.key] ?? 0 }))

  const total = segments.reduce((sum, s) => sum + s.count, 0) || 1

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Pipeline de recrutement</h2>
          <p className="text-xs text-gray-400 mt-0.5">{total} candidature{total > 1 ? 's' : ''} au total</p>
        </div>
        <Link to="/applications" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
          Gérer <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-5">
        {segments.map(s => s.count > 0 && (
          <div
            key={s.key}
            className={`${s.color} transition-all duration-500`}
            style={{ width: `${(s.count / total) * 100}%` }}
            title={`${s.label}: ${s.count}`}
          />
        ))}
        {total === 1 && <div className="bg-gray-100 flex-1 rounded-full" />}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {segments.map(s => (
          <div key={s.key} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AvatarInitials({ name, colorClass }) {
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${colorClass}`}>
      {initials}
    </div>
  )
}

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-pink-500', 'bg-blue-500',
  'bg-emerald-500', 'bg-orange-500', 'bg-cyan-500', 'bg-rose-500',
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Impossible de charger les statistiques'))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="space-y-6">

        {/* Bandeau de bienvenue */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white shadow-lg">
          <div className="relative z-10">
            <p className="text-sm text-indigo-200 capitalize">{dateStr}</p>
            <h1 className="text-2xl font-bold mt-1">{greeting}, {user?.name} 👋</h1>
            <p className="text-indigo-200 text-sm mt-1">Voici un résumé de votre activité de recrutement</p>
            <div className="flex gap-3 mt-4">
              <Link to="/candidates/new" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" /> Nouveau candidat
              </Link>
              <Link to="/job-offers/new" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" /> Nouvelle offre
              </Link>
              <Link to="/interviews/new" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" /> Planifier entretien
              </Link>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 right-16 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Postes ouverts"
            value={stats?.openPositions ?? 0}
            icon={Briefcase}
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
            sub="offres publiées"
          />
          <StatCard
            title="Candidats actifs"
            value={stats?.activeCandidates ?? 0}
            icon={Users}
            gradient="bg-gradient-to-br from-violet-500 to-violet-700"
            sub="dans le pipeline"
          />
          <StatCard
            title="Taux de conversion"
            value={`${((stats?.conversionRate ?? 0) * 100).toFixed(0)}%`}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
            sub="candidatures acceptées"
          />
          <StatCard
            title="Délai moyen"
            value={`${(stats?.averageRecruitmentDays ?? 0).toFixed(0)}j`}
            icon={Clock}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
            sub="de recrutement"
          />
        </div>

        {/* Pipeline + Candidatures récentes */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* Pipeline */}
          <div className="xl:col-span-2">
            <PipelineBar byStatus={stats?.applicationsByStatus ?? {}} />
          </div>

          {/* Candidatures récentes */}
          <div className="xl:col-span-3 card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Candidatures récentes</h2>
                <p className="text-xs text-gray-400 mt-0.5">Les 8 dernières entrées</p>
              </div>
              <Link
                to="/applications"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                Voir tout <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {!stats?.recentApplications?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                <FileText className="w-10 h-10 mb-2" />
                <p className="text-sm">Aucune candidature pour le moment</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recentApplications.map((app, i) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <AvatarInitials
                      name={app.candidateName}
                      colorClass={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{app.candidateName}</p>
                      <p className="text-xs text-gray-400 truncate">{app.jobOfferTitle}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={app.status} />
                      <span className="text-xs text-gray-300">
                        {new Date(app.appliedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Accès rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/candidates',   label: 'Candidats',    icon: Users,          cls: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
            { to: '/job-offers',   label: 'Offres',       icon: Briefcase,      cls: 'text-violet-600 bg-violet-50 hover:bg-violet-100' },
            { to: '/applications', label: 'Candidatures', icon: TrendingUp,     cls: 'text-blue-600 bg-blue-50 hover:bg-blue-100'       },
            { to: '/interviews',   label: 'Entretiens',   icon: Calendar,       cls: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
          ].map(({ to, label, icon: Icon, cls }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl font-medium text-sm transition-colors ${cls}`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </div>

      </div>
    </Layout>
  )
}

// Local import for icon fallback
function FileText({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
