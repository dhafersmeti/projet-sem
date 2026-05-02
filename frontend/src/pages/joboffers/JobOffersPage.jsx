import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import ConfirmDialog from '../../components/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge'
import { jobOffersApi } from '../../api/jobOffersApi'
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'

export default function JobOffersPage() {
  const navigate = useNavigate()
  const [offers, setOffers]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  const load = () => {
    setLoading(true)
    jobOffersApi.findAll()
      .then(({ data }) => setOffers(data))
      .catch(() => toast.error('Impossible de charger les offres'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async () => {
    try {
      await jobOffersApi.delete(deleteId)
      toast.success('Offre supprimée')
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
          <h1 className="page-title">Offres d'emploi</h1>
          <p className="text-gray-500 mt-1">{offers.length} offre(s)</p>
        </div>
        <Link to="/job-offers/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Créer une offre
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Spinner /></div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Briefcase className="w-10 h-10 mb-2" />
            <p>Aucune offre publiée</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Titre</th>
                <th className="table-header">Description</th>
                <th className="table-header">Date</th>
                <th className="table-header">Statut</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium text-gray-900">{o.title}</td>
                  <td className="table-cell text-gray-500 max-w-xs">
                    <span className="line-clamp-2">{o.description || '—'}</span>
                  </td>
                  <td className="table-cell text-gray-400">
                    {new Date(o.datePosted).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/job-offers/${o.id}/edit`)}
                        className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(o.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Supprimer l'offre"
        message="Cette offre sera définitivement supprimée avec toutes ses candidatures associées."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Layout>
  )
}
