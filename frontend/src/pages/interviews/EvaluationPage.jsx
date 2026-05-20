import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import { evaluationsApi } from '../../api/evaluationsApi'
import { interviewsApi } from '../../api/interviewsApi'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function ScoreSlider({ label, value, onChange, readonly }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-indigo-600">{value} / 5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={e => onChange?.(Number(e.target.value))}
        disabled={readonly}
        className="w-full accent-indigo-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
      </div>
    </div>
  )
}

export default function EvaluationPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [interview, setInterview] = useState(null)
  const [existing, setExisting]   = useState(null)
  const [scores, setScores]       = useState({ competenceScore: 3, attitudeScore: 3, potentialScore: 3 })
  const [comment, setComment]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [fetching, setFetching]   = useState(true)

  useEffect(() => {
    Promise.all([
      interviewsApi.findById(id),
      evaluationsApi.findByInterview(id).catch(() => null),
    ]).then(([{ data: iv }, evalRes]) => {
      setInterview(iv)
      if (evalRes?.data) {
        const e = evalRes.data
        setExisting(e)
        setScores({
          competenceScore: e.competenceScore ?? 3,
          attitudeScore:   e.attitudeScore   ?? 3,
          potentialScore:  e.potentialScore  ?? 3,
        })
        setComment(e.comment || '')
      }
    })
    .catch(() => { toast.error('Entretien introuvable'); navigate('/interviews') })
    .finally(() => setFetching(false))
  }, [id, navigate])

  const globalScore = ((scores.competenceScore + scores.attitudeScore + scores.potentialScore) / 3).toFixed(1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await evaluationsApi.create({
        interviewId:      Number(id),
        competenceScore:  scores.competenceScore,
        attitudeScore:    scores.attitudeScore,
        potentialScore:   scores.potentialScore,
        comment,
      })
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
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="font-medium text-gray-800">{interview?.candidateName}</p>
          <p className="text-sm text-gray-500">{interview?.jobOfferTitle}</p>
          <p className="text-xs text-gray-400 mt-1">
            {interview?.date && new Date(interview.date).toLocaleDateString('fr-FR')} à {interview?.time?.substring(0, 5)}
            {interview?.location && ` — ${interview.location}`}
          </p>
        </div>

        {existing ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800">Entretien déjà évalué</p>
                <p className="text-sm text-gray-500">
                  Score global : <span className="font-bold text-indigo-600">{existing.globalScore?.toFixed(1)} / 5</span>
                  {existing.recommendation && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      existing.recommendation === 'HIRE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {existing.recommendation === 'HIRE' ? 'Recommandé' : 'Non recommandé'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <ScoreSlider label="Compétences techniques" value={existing.competenceScore ?? 3} readonly />
            <ScoreSlider label="Attitude / comportement"  value={existing.attitudeScore   ?? 3} readonly />
            <ScoreSlider label="Potentiel"                value={existing.potentialScore  ?? 3} readonly />
            {existing.comment && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{existing.comment}</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <ScoreSlider
              label="Compétences techniques"
              value={scores.competenceScore}
              onChange={v => setScores(s => ({ ...s, competenceScore: v }))}
            />
            <ScoreSlider
              label="Attitude / comportement"
              value={scores.attitudeScore}
              onChange={v => setScores(s => ({ ...s, attitudeScore: v }))}
            />
            <ScoreSlider
              label="Potentiel"
              value={scores.potentialScore}
              onChange={v => setScores(s => ({ ...s, potentialScore: v }))}
            />

            <div className="flex items-center gap-3 bg-indigo-50 rounded-xl p-3">
              <span className="text-sm text-indigo-700 font-medium">Score global estimé :</span>
              <span className="text-2xl font-bold text-indigo-600">{globalScore} <span className="text-sm font-normal">/ 5</span></span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
              <textarea
                className="input-field resize-none"
                rows={3}
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
