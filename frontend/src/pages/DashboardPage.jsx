import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import { dashboardApi } from '../api/dashboardApi'
import { Users, Briefcase, FileText, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Impossible de charger les statistiques'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="page-title">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de votre activité de recrutement</p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total candidats"
          value={stats?.totalCandidates ?? 0}
          icon={Users}
          color="bg-primary-500"
        />
        <StatCard
          title="Offres actives"
          value={stats?.totalJobOffers ?? 0}
          icon={Briefcase}
          color="bg-emerald-500"
        />
        <StatCard
          title="Candidatures en cours"
          value={stats?.activeApplications ?? 0}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Dernières candidatures */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Candidatures récentes</h2>
          <Link to="/applications" className="text-sm text-primary-600 hover:underline">
            Voir tout
          </Link>
        </div>

        {!stats?.recentApplications?.length ? (
          <p className="text-gray-400 text-sm py-4 text-center">Aucune candidature pour le moment</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Candidat</th>
                  <th className="table-header">Offre</th>
                  <th className="table-header">Statut</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{app.candidateName}</td>
                    <td className="table-cell text-gray-500">{app.jobOfferTitle}</td>
                    <td className="table-cell">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="table-cell text-gray-400">
                      {new Date(app.appliedDate).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
