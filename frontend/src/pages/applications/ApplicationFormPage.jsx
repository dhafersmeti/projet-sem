import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import { applicationsApi } from '../../api/applicationsApi'
import { candidatesApi } from '../../api/candidatesApi'
import { jobOffersApi } from '../../api/jobOffersApi'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ApplicationFormPage() {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [offers, setOffers]         = useState([])
  const [form, setForm]             = useState({ candidateId: '', jobOfferId: '' })
  const [errors, setErrors]         = useState({})
  const [loading, setLoading]       = useState(false)
  const [fetching, setFetching]     = useState(true)

  useEffect(() => {
    Promise.all([candidatesApi.findAll(), jobOffersApi.findAll()])
      .then(([{ data: c }, { data: o }]) => {
        setCandidates(c)
        setOffers(o.filter((of) => of.status === 'OPEN'))
      })
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setFetching(false))
  }, [])

  const validate = () => {
    const errs = {}
    if (!form.candidateId) errs.candidateId = 'Sélectionnez un candidat'
    if (!form.jobOfferId)  errs.jobOfferId  = "Sélectionnez une offre"
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await applicationsApi.create({
        candidateId: Number(form.candidateId),
        jobOfferId:  Number(form.jobOfferId),
      })
      toast.success('Candidature créée avec succès')
      navigate('/applications')
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
        <h1 className="page-title">Nouvelle candidature</h1>
      </div>

      <div className="card max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidat *</label>
            <select
              className={`input-field ${errors.candidateId ? 'border-red-400' : ''}`}
              value={form.candidateId}
              onChange={(e) => setForm({ ...form, candidateId: e.target.value })}
            >
              <option value="">-- Sélectionner un candidat --</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
            {errors.candidateId && <p className="text-red-500 text-xs mt-1">{errors.candidateId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offre d'emploi *</label>
            <select
              className={`input-field ${errors.jobOfferId ? 'border-red-400' : ''}`}
              value={form.jobOfferId}
              onChange={(e) => setForm({ ...form, jobOfferId: e.target.value })}
            >
              <option value="">-- Sélectionner une offre --</option>
              {offers.map((o) => (
                <option key={o.id} value={o.id}>{o.title}</option>
              ))}
            </select>
            {errors.jobOfferId && <p className="text-red-500 text-xs mt-1">{errors.jobOfferId}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Création...' : 'Créer la candidature'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
