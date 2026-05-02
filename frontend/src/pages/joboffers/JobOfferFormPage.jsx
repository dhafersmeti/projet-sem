import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import { jobOffersApi } from '../../api/jobOffersApi'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { title: '', description: '', status: 'OPEN' }

export default function JobOfferFormPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = Boolean(id)

  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    jobOffersApi.findById(id)
      .then(({ data }) => setForm({
        title: data.title, description: data.description || '', status: data.status
      }))
      .catch(() => { toast.error('Offre introuvable'); navigate('/job-offers') })
      .finally(() => setFetching(false))
  }, [id, isEdit, navigate])

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Le titre est obligatoire'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      if (isEdit) {
        await jobOffersApi.update(id, form)
      } else {
        await jobOffersApi.create(form)
      }
      toast.success(isEdit ? 'Offre modifiée' : 'Offre créée')
      navigate('/job-offers')
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
        <h1 className="page-title">{isEdit ? "Modifier l'offre" : "Nouvelle offre d'emploi"}</h1>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              className={`input-field ${errors.title ? 'border-red-400' : ''}`}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Développeur Java Senior"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="input-field resize-none"
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description du poste, missions, profil recherché..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="OPEN">Ouverte</option>
              <option value="CLOSED">Fermée</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Enregistrement...' : (isEdit ? 'Enregistrer' : "Créer l'offre")}
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
