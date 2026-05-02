import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import { candidatesApi } from '../../api/candidatesApi'
import { ArrowLeft, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { name: '', email: '', phone: '', skills: '' }

export default function CandidateFormPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const isEdit    = Boolean(id)

  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [cvFile, setCvFile]   = useState(null)

  useEffect(() => {
    if (!isEdit) return
    candidatesApi.findById(id)
      .then(({ data }) => setForm({
        name: data.name, email: data.email,
        phone: data.phone || '', skills: data.skills || ''
      }))
      .catch(() => { toast.error('Candidat introuvable'); navigate('/candidates') })
      .finally(() => setFetching(false))
  }, [id, isEdit, navigate])

  const validate = () => {
    const errs = {}
    if (!form.name.trim())  errs.name  = 'Le nom est obligatoire'
    if (!form.email.trim()) errs.email = "L'email est obligatoire"
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide'
    if (cvFile && !cvFile.name.endsWith('.pdf')) errs.cv = 'Seuls les PDF sont acceptés'
    if (cvFile && cvFile.size > 5 * 1024 * 1024) errs.cv = 'Le fichier ne doit pas dépasser 5 MB'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      let candidate
      if (isEdit) {
        const { data } = await candidatesApi.update(id, form)
        candidate = data
      } else {
        const { data } = await candidatesApi.create(form)
        candidate = data
      }
      // Upload CV si sélectionné
      if (cvFile) {
        await candidatesApi.uploadCv(candidate.id, cvFile)
      }
      toast.success(isEdit ? 'Candidat modifié avec succès' : 'Candidat créé avec succès')
      navigate('/candidates')
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <Layout><div className="flex justify-center h-48 items-center"><Spinner /></div></Layout>
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary text-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="page-title">
            {isEdit ? 'Modifier le candidat' : 'Nouveau candidat'}
          </h1>
        </div>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet *
              </label>
              <input
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jean Dupont"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jean@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+33 6 00 00 00 00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compétences</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="Java, Spring Boot, React, MySQL..."
            />
          </div>

          {/* Upload CV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CV (PDF, max 5 MB)
            </label>
            <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">
                {cvFile ? cvFile.name : 'Cliquer pour sélectionner un PDF'}
              </span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setCvFile(e.target.files[0] || null)}
              />
            </label>
            {errors.cv && <p className="text-red-500 text-xs mt-1">{errors.cv}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Enregistrement...' : (isEdit ? 'Enregistrer' : 'Créer le candidat')}
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
