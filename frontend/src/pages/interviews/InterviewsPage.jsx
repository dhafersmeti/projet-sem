import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import ConfirmDialog from '../../components/ConfirmDialog'
import { interviewsApi } from '../../api/interviewsApi'
import { Plus, Trash2, Calendar, Star } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InterviewsPage() {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading]       = useState(true)
  const [deleteId, setDeleteId]     = useState(null)

  const load = () => {
    setLoading(true)
    interviewsApi.findAll()
      .then(({ data }) => setInterviews(data))
      .catch(() => toast.error('Impossible de charger les entretiens'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async () => {
    try {
      await interviewsApi.delete(deleteId)
      toast.success('Entretien supprimé')
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
          <h1 className="page-title">Entretiens</h1>
          <p className="text-gray-500 mt-1">{interviews.length} entretien(s) planifié(s)</p>
        </div>
        <Link to="/interviews/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Planifier
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Spinner /></div>
        ) : interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Calendar className="w-10 h-10 mb-2" />
            <p>Aucun entretien planifié</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Candidat</th>
                <th className="table-header">Offre</th>
                <th className="table-header">Date</th>
                <th className="table-header">Heure</th>
                <th className="table-header">Lieu</th>
                <th className="table-header">Évaluation</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((iv) => (
                <tr key={iv.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium text-gray-900">{iv.candidateName}</td>
                  <td className="table-cell text-gray-500">{iv.jobOfferTitle}</td>
                  <td className="table-cell text-gray-600">
                    {new Date(iv.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="table-cell text-gray-600">{iv.time?.substring(0, 5)}</td>
                  <td className="table-cell text-gray-500">{iv.location}</td>
                  <td className="table-cell">
                    {iv.hasEvaluation ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Évalué</span>
                    ) : (
                      <Link
                        to={`/interviews/${iv.id}/evaluate`}
                        className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full hover:bg-primary-100 transition-colors"
                      >
                        Évaluer
                      </Link>
                    )}
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => setDeleteId(iv.id)}
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
        title="Supprimer l'entretien"
        message="Cet entretien et son évaluation seront définitivement supprimés."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Layout>
  )
}
