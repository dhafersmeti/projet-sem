import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import StatusBadge from '../../components/StatusBadge'
import { dashboardApi } from '../../api/dashboardApi'
import { Download, FileText, BarChart2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const [report, setReport]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.getReportByPos()
      .then(({ data }) => setReport(data))
      .catch(() => toast.error('Erreur chargement rapport'))
      .finally(() => setLoading(false))
  }, [])

  const downloadFile = async (fn, filename) => {
    try {
      const { data } = await fn()
      const url = URL.createObjectURL(new Blob([data]))
      const a = document.createElement('a'); a.href = url; a.download = filename
      a.click(); URL.revokeObjectURL(url)
      toast.success(`${filename} téléchargé`)
    } catch { toast.error('Erreur lors du téléchargement') }
  }

  const maxApps = Math.max(...report.map(r => r.totalApplications), 1)

  if (loading) return <Layout><div className="flex justify-center py-20"><Spinner /></div></Layout>

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
            <p className="text-sm text-gray-400 mt-0.5">Statistiques par poste et exports</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => downloadFile(dashboardApi.exportCsv, 'rapport_recrutement.csv')}
              className="btn-secondary gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={() => downloadFile(dashboardApi.exportPdf, 'rapport_recrutement.pdf')}
              className="btn-primary gap-2"
            >
              <FileText className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        {/* Tableau par poste */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-500" /> Résultats par poste
          </h2>
          {!report.length ? (
            <p className="text-sm text-gray-400 py-6 text-center">Aucune donnée disponible.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Poste</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">Total</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">Acceptés</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">Refusés</th>
                    <th className="text-right py-2 pl-3 text-gray-500 font-medium">Taux conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {report.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium text-gray-900">{row.position}</p>
                          {/* Mini barre */}
                          <div className="h-1.5 bg-gray-100 rounded-full mt-1 w-32">
                            <div
                              className="h-1.5 bg-indigo-400 rounded-full"
                              style={{ width: `${(row.totalApplications / maxApps) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-gray-800">{row.totalApplications}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-emerald-600 font-medium">{row.accepted}</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-red-500 font-medium">{row.rejected}</span>
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <span className={`font-semibold ${row.conversionRate > 0.3 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {(row.conversionRate * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
