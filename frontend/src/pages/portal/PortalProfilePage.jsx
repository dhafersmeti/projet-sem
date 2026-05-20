import { useEffect, useState, useRef } from 'react'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import { candidatePortalApi } from '../../api/candidatePortalApi'
import { Upload, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PortalProfilePage() {
  const [form, setForm]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    candidatePortalApi.getProfile()
      .then(({ data }) => setForm({
        phone: data.phone || '', skills: data.skills || '',
        coverLetter: data.coverLetter || '', experiences: data.experiences || '',
        diplomas: data.diplomas || '', cvFileName: data.cvFileName || '',
      }))
      .catch(() => toast.error('Impossible de charger le profil'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await candidatePortalApi.updateProfile(form)
      toast.success('Profil mis à jour')
    } catch { toast.error('Erreur lors de la sauvegarde') }
    finally { setSaving(false) }
  }

  const handleCv = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('Seuls les PDF sont acceptés'); return }
    setUploading(true)
    try {
      await candidatePortalApi.uploadCv(file)
      setForm(f => ({ ...f, cvFileName: file.name }))
      toast.success('CV uploadé avec succès')
    } catch { toast.error("Erreur lors de l'upload") }
    finally { setUploading(false) }
  }

  if (loading) return <Layout><div className="flex justify-center py-20"><Spinner /></div></Layout>

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

        <form onSubmit={handleSave} className="card space-y-5">
          {[
            { key: 'phone',       label: 'Téléphone',           type: 'text',     rows: 0 },
            { key: 'skills',      label: 'Compétences',          type: 'textarea', rows: 3 },
            { key: 'coverLetter', label: 'Lettre de motivation', type: 'textarea', rows: 5 },
            { key: 'experiences', label: 'Expériences',          type: 'textarea', rows: 4 },
            { key: 'diplomas',    label: 'Diplômes',             type: 'textarea', rows: 3 },
          ].map(({ key, label, type, rows }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              {type === 'textarea' ? (
                <textarea
                  rows={rows}
                  className="input-field resize-none"
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={label}
                />
              ) : (
                <input
                  type="text"
                  className="input-field"
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                />
              )}
            </div>
          ))}

          <button type="submit" disabled={saving} className="btn-primary gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </form>

        {/* Upload CV */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Curriculum Vitae</h2>
          {form.cvFileName && (
            <p className="text-sm text-gray-600 mb-3">
              CV actuel : <span className="font-medium text-indigo-700">{form.cvFileName}</span>
            </p>
          )}
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleCv} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-secondary gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Upload en cours...' : 'Changer le CV (PDF)'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
