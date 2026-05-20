import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { candidatePortalApi } from '../../api/candidatePortalApi'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import Spinner from '../../components/Spinner'
import {
  Briefcase, Clock, CheckCircle, XCircle,
  Calendar, ArrowRight, Search
} from 'lucide-react'

const STATUS_ICON = {
  PENDING:   { icon: Clock,         color: 'text-amber-500',   bg: 'bg-amber-50'  },
  INTERVIEW: { icon: Calendar,      color: 'text-blue-500',    bg: 'bg-blue-50'   },
  ACCEPTED:  { icon: CheckCircle,   color: 'text-emerald-500', bg: 'bg-emerald-50'},
  REJECTED:  { icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-50'    },
}

function MiniStat({ label, value, color }) {
  return (
    <div className={`rounded-2xl p-4 text-center ${color}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-1 opacity-75">{label}</p>
    </div>
  )
}

export default function CandidatePortalPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    candidatePortalApi.getApplications()
      .then(({ data }) => setApplications(data))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total:     applications.length,
    pending:   applications.filter(a => a.status === 'PENDING').length,
    interview: applications.filter(a => a.status === 'INTERVIEW').length,
    accepted:  applications.filter(a => a.status === 'ACCEPTED').length,
    rejected:  applications.filter(a => a.status === 'REJECTED').length,
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <Layout>
      <div className="space-y-6">

        {/* Bandeau */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white shadow-lg">
          <div className="relative z-10">
            <p className="text-indigo-200 text-sm">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-2xl font-bold mt-1">{greeting}, {user?.name} 👋</h1>
            <p className="text-indigo-200 text-sm mt-1">Suivez l'avancement de vos candidatures en temps réel</p>
            <div className="flex gap-3 mt-4">
              <Link
                to="/portal/job-offers"
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <Search className="w-3.5 h-3.5" /> Voir les offres
              </Link>
              <Link
                to="/portal/applications"
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5" /> Mes candidatures
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 right-16 w-28 h-28 bg-white/5 rounded-full translate-y-1/2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="Total"      value={stats.total}     color="bg-slate-100 text-slate-700"   />
          <MiniStat label="En attente" value={stats.pending}   color="bg-amber-50 text-amber-700"    />
          <MiniStat label="Entretien"  value={stats.interview} color="bg-blue-50 text-blue-700"      />
          <MiniStat label="Acceptées"  value={stats.accepted}  color="bg-emerald-50 text-emerald-700"/>
        </div>

        {/* Liste candidatures récentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Mes candidatures</h2>
              <p className="text-xs text-gray-400 mt-0.5">{stats.total} candidature{stats.total > 1 ? 's' : ''}</p>
            </div>
            <Link
              to="/portal/applications"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
              <Briefcase className="w-12 h-12 mb-3" />
              <p className="text-sm font-medium text-gray-400">Aucune candidature pour le moment</p>
              <Link to="/portal/job-offers" className="mt-3 text-xs text-indigo-600 hover:underline font-medium">
                Parcourir les offres →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {applications.slice(0, 5).map(app => {
                const cfg = STATUS_ICON[app.status] || STATUS_ICON.PENDING
                const Icon = cfg.icon
                return (
                  <Link
                    key={app.id}
                    to={`/portal/applications/${app.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon className={`w-4.5 h-4.5 ${cfg.color}`} style={{ width: 18, height: 18 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{app.jobOfferTitle}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Postulé le {new Date(app.appliedDate).toLocaleDateString('fr-FR')}
                        {app.interviews?.length > 0 && ` · ${app.interviews.length} entretien${app.interviews.length > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={app.status} />
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}
