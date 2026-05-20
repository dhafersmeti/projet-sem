import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import Pipeline from '../../components/Pipeline'
import Timeline from '../../components/Timeline'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import { candidatePortalApi } from '../../api/candidatePortalApi'
import { FileText, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PortalApplicationPage() {
  const [app, setApp]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    candidatePortalApi.getApplication()
      .then(({ data }) => setApp(data))
      .catch(() => toast.error('Impossible de charger la candidature'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><div className="flex justify-center py-20"><Spinner /></div></Layout>

  if (!app) return (
    <Layout>
      <EmptyState icon={FileText} title="Aucune candidature" description="Vous n'avez pas encore de candidature active." />
    </Layout>
  )

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Ma candidature</h1>
          <StatusBadge status={app.status} />
        </div>

        {/* Infos offre */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Poste</h2>
          <p className="text-lg font-bold text-gray-900">{app.jobOfferTitle}</p>
          {app.jobOfferDescription && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{app.jobOfferDescription}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Déposée le {new Date(app.appliedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Pipeline */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Pipeline de recrutement</h2>
          <Pipeline currentStatus={app.status} />
        </div>

        {/* Entretiens */}
        {app.interviews?.length > 0 && (
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Entretiens
            </h2>
            <div className="space-y-3">
              {app.interviews.map(iv => (
                <div key={iv.id} className="bg-gray-50 rounded-xl p-3 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">
                      {new Date(`${iv.date}T${iv.time}`).toLocaleString('fr-FR', {
                        weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <StatusBadge status={iv.status} />
                  </div>
                  {iv.location && <p className="text-gray-500">📍 {iv.location}</p>}
                  {iv.meetingLink && (
                    <a href={iv.meetingLink} target="_blank" rel="noreferrer"
                      className="text-indigo-600 hover:underline text-xs">
                      🔗 Lien visioconférence
                    </a>
                  )}
                  {iv.preparationInstructions && (
                    <p className="text-gray-600 mt-1 text-xs italic">💡 {iv.preparationInstructions}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historique statuts */}
        {app.statusHistory?.length > 0 && (
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Historique des statuts</h2>
            <Timeline history={app.statusHistory} />
          </div>
        )}
      </div>
    </Layout>
  )
}
