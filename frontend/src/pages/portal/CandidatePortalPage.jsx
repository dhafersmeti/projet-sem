import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { candidatePortalApi } from '../../api/candidatePortalApi'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import Spinner from '../../components/Spinner'
import { Briefcase, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'

const STATUS_ICON = {
  PENDING:   <Clock className="w-5 h-5 text-yellow-500" />,
  INTERVIEW: <Calendar className="w-5 h-5 text-blue-500" />,
  ACCEPTED:  <CheckCircle className="w-5 h-5 text-green-500" />,
  REJECTED:  <XCircle className="w-5 h-5 text-red-500" />,
}

export default function CandidatePortalPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    candidatePortalApi.getApplications()
      .then(({ data }) => setApplications(data))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total:    applications.length,
    pending:  applications.filter(a => a.status === 'PENDING').length,
    interview:applications.filter(a => a.status === 'INTERVIEW').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user?.name}</h1>
          <p className="text-gray-500 mt-1">Suivez l'avancement de vos candidatures</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total',      value: stats.total,     color: 'bg-gray-50 border-gray-200',   text: 'text-gray-700' },
            { label: 'En attente', value: stats.pending,   color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
            { label: 'Entretien',  value: stats.interview, color: 'bg-blue-50 border-blue-200',   text: 'text-blue-700' },
            { label: 'Acceptée',   value: stats.accepted,  color: 'bg-green-50 border-green-200', text: 'text-green-700' },
          ].map(s => (
            <div key={s.label} className={`card border ${s.color} text-center`}>
              <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Liste des candidatures */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Mes candidatures</h2>

          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : applications.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Aucune candidature pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <Link
                  key={app.id}
                  to={`/portal/applications/${app.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {STATUS_ICON[app.status]}
                    <div>
                      <p className="font-medium text-gray-900">{app.jobOfferTitle}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Postulé le {new Date(app.appliedDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                    {app.interviews?.length > 0 && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {app.interviews.length} entretien{app.interviews.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
