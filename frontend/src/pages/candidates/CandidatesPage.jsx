import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import ConfirmDialog from '../../components/ConfirmDialog'
import { candidatesApi } from '../../api/candidatesApi'
import { Plus, Search, Eye, Pencil, Trash2, UserX } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CandidatesPage() {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [deleteId, setDeleteId]     = useState(null)

  const load = (q = '') => {
    setLoading(true)
    candidatesApi.findAll(q)
      .then(({ data }) => setCandidates(data))
      .catch(() => toast.error('Impossible de charger les candidats'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    load(search)
  }

  const handleDelete = async () => {
    try {
      await candidatesApi.delete(deleteId)
      toast.success('Candidat supprimé')
      load(search)
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
          <h1 className="page-title">Candidats</h1>
          <p className="text-gray-500 mt-1">{candidates.length} candidat(s) trouvé(s)</p>
        </div>
        <Link to="/candidates/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Ajouter
        </Link>
      </div>

      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Rechercher par nom, email, compétences..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              if (e.target.value === '') load('')
            }}
          />
        </div>
        <button type="submit" className="btn-primary">Rechercher</button>
      </form>

      {/* Tableau */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner />
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <UserX className="w-10 h-10 mb-2" />
            <p>Aucun candidat trouvé</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Nom</th>
                <th className="table-header">Email</th>
                <th className="table-header">Téléphone</th>
                <th className="table-header">Compétences</th>
                <th className="table-header">CV</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium text-gray-900">{c.name}</td>
                  <td className="table-cell text-gray-500">{c.email}</td>
                  <td className="table-cell text-gray-500">{c.phone || '—'}</td>
                  <td className="table-cell">
                    <span className="text-gray-500 truncate max-w-[180px] block">
                      {c.skills || '—'}
                    </span>
                  </td>
                  <td className="table-cell">
                    {c.cvFileName ? (
                      <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                        {c.cvFileName}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Aucun</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/candidates/${c.id}`)}
                        className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/candidates/${c.id}/edit`)}
                        className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Supprimer"
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
        title="Supprimer le candidat"
        message="Cette action est irréversible. Le candidat et son CV seront définitivement supprimés."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Layout>
  )
}
