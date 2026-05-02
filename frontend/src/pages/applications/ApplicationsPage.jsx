import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import ConfirmDialog from '../../components/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge'
import { applicationsApi } from '../../api/applicationsApi'
import { Plus, Trash2, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = ['PENDING', 'INTERVIEW', 'ACCEPTED', 'REJECTED']
const STATUS_LABELS = { PENDING: 'En attente', INTERVIEW: 'Entretien', ACCEPTED: 'Accepté', REJECTED: 'Refusé' }

export default function ApplicationsPage() {
  const navigate = useNavigate()
  const [apps, setApps]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  const load = () => {
    setLoading(true)
    applicationsApi.findAll()
      .then(({ data }) => setApps(data))
      .catch(() => toast.error('Impossible de charger les candidatures'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await applicationsApi.updateStatus(id, status)
      setApps((prev) => prev.map((a) => a.id === id ? data : a))
      toast.success('Statut mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async () => {
    try {
      await applicationsApi.delete(deleteId)
      toast.success('Candidature supprimée')
      load()
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Candidatures</h1>
          <p className="text-gray-500 mt-1">{apps.length} candidature(s)</p>
        </div>
        <Link to="/applications/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Ajouter
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Spinner /></div>
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <FileText className="w-10 h-10 mb-2" />
            <p>Aucune candidature enregistrée</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Candidat</th>
                <th className="table-header">Offre</th>
                <th className="table-header">Statut</th>
                <th className="table-header">Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div>
                      <p className="font-medium text-gray-900">{app.candidateName}</p>
                      <p className="text-xs text-gray-400">{app.candidateEmail}</p>
                    </div>
                  </td>
                  <td className="table-cell text-gray-600">{app.jobOfferTitle}</td>
                  <td className="table-cell">
                    {/* Dropdown de changement de statut inline */}
                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-400 bg-white"
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="table-cell text-gray-400">
                    {new Date(app.appliedDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => setDeleteId(app.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Supprimer la candidature"
        message="Cette candidature sera définitivement supprimée."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Layout>
  )
}
