import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import { candidatePortalApi } from '../../api/candidatePortalApi'
import { Bell, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const TYPE_ICON = { STATUS_CHANGE: '📋', INTERVIEW: '📅', OFFER: '🎁', CREDENTIALS: '🔑', GENERAL: '📢' }
const TYPE_COLOR = {
  STATUS_CHANGE: 'border-indigo-100 bg-indigo-50',
  INTERVIEW:     'border-blue-100 bg-blue-50',
  OFFER:         'border-emerald-100 bg-emerald-50',
  CREDENTIALS:   'border-amber-100 bg-amber-50',
  GENERAL:       'border-gray-100 bg-gray-50',
}

export default function PortalNotificationsPage() {
  const [notifs, setNotifs]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    candidatePortalApi.getNotifications()
      .then(({ data }) => setNotifs(data))
      .catch(() => toast.error('Impossible de charger les notifications'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleRead = async (id) => {
    await candidatePortalApi.markAsRead(id)
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x))
  }

  const handleReadAll = async () => {
    await candidatePortalApi.markAllAsRead()
    setNotifs(n => n.map(x => ({ ...x, read: true })))
    toast.success('Toutes les notifications marquées comme lues')
  }

  if (loading) return <Layout><div className="flex justify-center py-20"><Spinner /></div></Layout>

  const unread = notifs.filter(n => !n.read).length

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unread > 0 && (
              <p className="text-sm text-indigo-600 mt-0.5">{unread} non lue{unread > 1 ? 's' : ''}</p>
            )}
          </div>
          {unread > 0 && (
            <button onClick={handleReadAll} className="btn-secondary text-xs gap-1.5">
              <CheckCheck className="w-4 h-4" /> Tout marquer comme lu
            </button>
          )}
        </div>

        {!notifs.length ? (
          <EmptyState icon={Bell} title="Aucune notification" description="Vous serez notifié ici des mises à jour de votre candidature." />
        ) : (
          <div className="space-y-2">
            {notifs.map(n => (
              <div
                key={n.id}
                onClick={() => !n.read && handleRead(n.id)}
                className={`
                  card cursor-pointer transition-all duration-200 border
                  ${n.read ? 'opacity-70' : 'shadow-md ' + (TYPE_COLOR[n.type] || 'border-gray-100 bg-gray-50')}
                `}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{TYPE_ICON[n.type] || '📢'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${n.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {n.title}
                      </p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('fr-FR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
