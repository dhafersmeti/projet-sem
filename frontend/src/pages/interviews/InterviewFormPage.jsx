import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import { interviewsApi } from '../../api/interviewsApi'
import { applicationsApi } from '../../api/applicationsApi'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InterviewFormPage() {
  const navigate = useNavigate()
  const [apps, setApps]     = useState([])
  const [form, setForm]     = useState({
    applicationId: '', date: '', time: '',
    location: '', meetingLink: '', preparationInstructions: '',
    status: 'PLANNED',
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    applicationsApi.findAll()
      .then(({ data }) => setApps(data))
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setFetching(false))
  }, [])

  const validate = () => {
    const errs = {}
    if (!form.applicationId) errs.applicationId = 'Sélectionnez une candidature'
    if (!form.date)          errs.date           = 'La date est obligatoire'
    if (!form.time)          errs.time           = "L'heure est obligatoire"
    return errs
  }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await interviewsApi.create({
        applicationId:          Number(form.applicationId),
        date:                   form.date,
        time:                   form.time,
        location:               form.location || null,
        meetingLink:            form.meetingLink || null,
        preparationInstructions: form.preparationInstructions || null,
        status:                 form.status,
      })
      toast.success('Entretien planifié avec succès')
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
        <h1 className="page-title">Planifier un entretien</h1>
      </div>

      <div className="card max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidature *</label>
            <select
              className={`input-field ${errors.applicationId ? 'border-red-400' : ''}`}
              value={form.applicationId}
              onChange={set('applicationId')}
            >
              <option value="">-- Sélectionner une candidature --</option>
              {apps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.candidateName} → {a.jobOfferTitle}
                </option>
              ))}
            </select>
            {errors.applicationId && <p className="text-red-500 text-xs mt-1">{errors.applicationId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                className={`input-field ${errors.date ? 'border-red-400' : ''}`}
                value={form.date}
                onChange={set('date')}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
              <input
                type="time"
                className={`input-field ${errors.time ? 'border-red-400' : ''}`}
                value={form.time}
                onChange={set('time')}
              />
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu (optionnel)</label>
              <input
                className="input-field"
                value={form.location}
                onChange={set('location')}
                placeholder="Salle A, Paris..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select className="input-field" value={form.status} onChange={set('status')}>
                <option value="PLANNED">Planifié</option>
                <option value="COMPLETED">Terminé</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lien visioconférence (optionnel)</label>
            <input
              type="url"
              className="input-field"
              value={form.meetingLink}
              onChange={set('meetingLink')}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions de préparation (optionnel)</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              value={form.preparationInstructions}
              onChange={set('preparationInstructions')}
              placeholder="Préparez un exposé de 10 minutes sur votre parcours. Apportez votre portfolio..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Planification...' : "Planifier l'entretien"}
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
