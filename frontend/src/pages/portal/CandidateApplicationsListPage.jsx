import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { candidatePortalApi } from '../../api/candidatePortalApi'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import Spinner from '../../components/Spinner'
import { Briefcase, ChevronRight } from 'lucide-react'

export default function CandidateApplicationsListPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    candidatePortalApi.getApplications()
      .then(({ data }) => setApplications(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes candidatures</h1>

        <div className="card">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : applications.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Aucune candidature pour le moment</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map(app => (
                <Link
                  key={app.id}
                  to={`/portal/applications/${app.id}`}
                  className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{app.jobOfferTitle}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Postulé le {new Date(app.appliedDate).toLocaleDateString('fr-FR')}
                      {app.interviews?.length > 0 && ` · ${app.interviews.length} entretien${app.interviews.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} />
                    <ChevronRight className="w-4 h-4 text-gray-400" />
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
