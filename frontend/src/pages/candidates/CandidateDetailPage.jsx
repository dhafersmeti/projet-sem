import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import StatusBadge from '../../components/StatusBadge'
import { candidatesApi } from '../../api/candidatesApi'
import { applicationsApi } from '../../api/applicationsApi'
import { ArrowLeft, Download, Pencil, Plus, Mail, Phone, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CandidateDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [candidate, setCandidate] = useState(null)
  const [apps, setApps]           = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      candidatesApi.findById(id),
      applicationsApi.findAll(),
    ])
      .then(([{ data: c }, { data: allApps }]) => {
        setCandidate(c)
        setApps(allApps.filter((a) => a.candidateId === Number(id)))
      })
      .catch(() => { toast.error('Candidat introuvable'); navigate('/candidates') })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleDownloadCv = async () => {
    try {
      const { data } = await candidatesApi.downloadCv(id)
      const url  = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href  = url
      link.download = candidate.cvFileName
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Impossible de télécharger le CV')
    }
  }

  if (loading) {
    return <Layout><div className="flex justify-center items-center h-64"><Spinner size="lg" /></div></Layout>
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary text-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="page-title">Profil candidat</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infos candidat */}
        <div className="card lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Informations</h2>
            <Link to={`/candidates/${id}/edit`} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded">
              <Pencil className="w-4 h-4" />
            </Link>
          </div>

          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
            {candidate.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              {candidate.email}
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {candidate.phone}
              </div>
            )}
            {candidate.skills && (
              <div className="flex items-start gap-2 text-gray-600">
                <Wrench className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-gray-500">{candidate.skills}</span>
              </div>
            )}
          </div>

          {/* CV */}
          <div className="pt-2 border-t border-gray-100">
            {candidate.cvFileName ? (
              <button onClick={handleDownloadCv} className="btn-primary text-sm w-full justify-center">
                <Download className="w-4 h-4" />
                Télécharger le CV
              </button>
            ) : (
              <p className="text-sm text-gray-400 text-center">Aucun CV disponible</p>
            )}
          </div>

          <p className="text-xs text-gray-400">
            Ajouté le {new Date(candidate.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Candidatures */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              Candidatures ({apps.length})
            </h2>
            <Link to="/applications/new" className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Postuler à une offre
            </Link>
          </div>

          {apps.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              Aucune candidature pour ce candidat
            </p>
          ) : (
            <div className="space-y-3">
              {apps.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{app.jobOfferTitle}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(app.appliedDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
