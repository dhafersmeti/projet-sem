import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { candidatePortalApi } from '../../api/candidatePortalApi'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import Spinner from '../../components/Spinner'
import { ArrowLeft, Calendar, MapPin, Star, MessageSquare } from 'lucide-react'

const STEPS = ['PENDING', 'INTERVIEW', 'ACCEPTED']

function ProgressBar({ status }) {
  if (status === 'REJECTED') {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <span className="text-red-600 font-medium text-sm">Candidature refusée</span>
      </div>
    )
  }
  const current = STEPS.indexOf(status)
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done    = i <= current
        const isLast  = i === STEPS.length - 1
        const labels  = { PENDING: 'En attente', INTERVIEW: 'Entretien', ACCEPTED: 'Accepté' }
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                done
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${done ? 'text-primary-600' : 'text-gray-400'}`}>
                {labels[step]}
              </span>
            </div>
            {!isLast && (
              <div className={`h-0.5 flex-1 mb-5 ${i < current ? 'bg-primary-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Stars({ score }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  )
}

export default function CandidateApplicationDetailPage() {
  const { id } = useParams()
  const [app, setApp]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    candidatePortalApi.getApplicationById(id)
      .then(({ data }) => setApp(data))
      .catch(() => setError('Candidature introuvable'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout><div className="flex justify-center py-20"><Spinner /></div></Layout>
  if (error)   return <Layout><p className="text-red-500 p-6">{error}</p></Layout>

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Retour */}
        <Link to="/portal" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Retour à mon espace
        </Link>

        {/* En-tête offre */}
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{app.jobOfferTitle}</h1>
              {app.jobOfferDescription && (
                <p className="text-gray-500 mt-2 text-sm">{app.jobOfferDescription}</p>
              )}
              <p className="text-xs text-gray-400 mt-3">
                Postulé le {new Date(app.appliedDate).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            <StatusBadge status={app.status} />
          </div>
        </div>

        {/* Barre de progression */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Avancement du dossier</h2>
          <ProgressBar status={app.status} />
        </div>

        {/* Entretiens */}
        {app.interviews?.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Entretien{app.interviews.length > 1 ? 's' : ''} ({app.interviews.length})
            </h2>
            <div className="space-y-4">
              {app.interviews.map((iv, idx) => (
                <div key={iv.id} className="border border-gray-100 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(iv.date).toLocaleDateString('fr-FR', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                      })} à {iv.time?.slice(0, 5)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {iv.location}
                    </span>
                  </div>

                  {iv.evaluation ? (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Stars score={iv.evaluation.score} />
                        <span className="text-xs text-gray-500">{iv.evaluation.score}/5</span>
                      </div>
                      {iv.evaluation.comment && (
                        <div className="flex gap-2 text-sm text-gray-600">
                          <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <p>{iv.evaluation.comment}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Évaluation non encore disponible</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message si accepté */}
        {app.status === 'ACCEPTED' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-medium">
            Félicitations ! Votre candidature a été acceptée. Le recruteur vous contactera prochainement.
          </div>
        )}
      </div>
    </Layout>
  )
}
