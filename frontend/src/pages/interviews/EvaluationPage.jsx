import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import StarRating from '../../components/StarRating'
import { evaluationsApi } from '../../api/evaluationsApi'
import { interviewsApi } from '../../api/interviewsApi'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EvaluationPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [interview, setInterview] = useState(null)
  const [existing, setExisting]   = useState(null)
  const [score, setScore]         = useState(0)
  const [comment, setComment]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [fetching, setFetching]   = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    Promise.all([
      interviewsApi.findById(id),
      evaluationsApi.findByInterview(id).catch(() => null),
    ]).then(([{ data: iv }, evalRes]) => {
      setInterview(iv)
      if (evalRes) {
        setExisting(evalRes.data)
        setScore(evalRes.data.score)
        setComment(evalRes.data.comment || '')
      }
    })
    .catch(() => { toast.error('Entretien introuvable'); navigate('/interviews') })
    .finally(() => setFetching(false))
  }, [id, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (score === 0) { setError('Veuillez attribuer une note'); return }
    setError('')
    setLoading(true)
    try {
      await evaluationsApi.create({ interviewId: Number(id), score, comment })
      toast.success('Évaluation enregistrée')
      navigate('/interviews')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <Layout><div className="flex justify-center items-center h-64"><Spinner /></div></Layout>
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary text-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="page-title">Évaluation de l'entretien</h1>
      </div>

      <div className="card max-w-xl">
        {/* Informations entretien */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="font-medium text-gray-800">{interview?.candidateName}</p>
          <p className="text-sm text-gray-500">{interview?.jobOfferTitle}</p>
          <p className="text-xs text-gray-400 mt-1">
            {interview?.date && new Date(interview.date).toLocaleDateString('fr-FR')} à {interview?.time?.substring(0, 5)} — {interview?.location}
          </p>
        </div>

        {existing ? (
          /* Évaluation existante en lecture seule */
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-medium text-gray-800">Entretien déjà évalué</p>
            <div className="flex justify-center">
              <StarRating value={existing.score} readonly />
            </div>
            {existing.comment && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 text-left">
                {existing.comment}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Note globale *
              </label>
              <StarRating value={score} onChange={setScore} />
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire
              </label>
              <textarea
                className="input-field resize-none"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Points forts, points faibles, impression générale..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Enregistrement...' : "Enregistrer l'évaluation"}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  )
}
