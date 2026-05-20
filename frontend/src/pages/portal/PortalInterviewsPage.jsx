import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import { candidatePortalApi } from '../../api/candidatePortalApi'
import { Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PortalInterviewsPage() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    candidatePortalApi.getInterviews()
      .then(({ data }) => setInterviews(data))
      .catch(() => toast.error('Impossible de charger les entretiens'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><div className="flex justify-center py-20"><Spinner /></div></Layout>

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes entretiens</h1>

        {!interviews.length ? (
          <EmptyState icon={Calendar} title="Aucun entretien" description="Vos entretiens apparaîtront ici une fois planifiés." />
        ) : (
          <div className="space-y-4">
            {interviews.map((iv, i) => (
              <div key={i} className="card space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-base">
                      {new Date(`${iv.date}T${iv.time}`).toLocaleDateString('fr-FR', {
                        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      à {iv.time?.slice(0, 5)}
                    </p>
                  </div>
                  <StatusBadge status={iv.status} />
                </div>

                {iv.location && (
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <span>📍</span> {iv.location}
                  </p>
                )}

                {iv.meetingLink && (
                  <a
                    href={iv.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    🔗 Rejoindre la visioconférence
                  </a>
                )}

                {iv.preparationInstructions && (
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <p className="text-xs font-semibold text-amber-700 mb-1">💡 Instructions de préparation</p>
                    <p className="text-sm text-amber-800">{iv.preparationInstructions}</p>
                  </div>
                )}

                {iv.evaluation && (
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-700 mb-1">✅ Évaluation reçue</p>
                    <p className="text-sm text-emerald-800">
                      Score global : <strong>{iv.evaluation.globalScore?.toFixed(1)} / 5</strong>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
