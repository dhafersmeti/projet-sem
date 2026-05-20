import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, ChevronRight } from 'lucide-react'
import { candidatePortalApi } from '../api/candidatePortalApi'

const TYPE_COLORS = {
  STATUS_CHANGE: 'bg-indigo-100 text-indigo-700',
  INTERVIEW:     'bg-blue-100 text-blue-700',
  OFFER:         'bg-emerald-100 text-emerald-700',
  CREDENTIALS:   'bg-amber-100 text-amber-700',
  GENERAL:       'bg-gray-100 text-gray-600',
}
const TYPE_ICONS = { STATUS_CHANGE: '📋', INTERVIEW: '📅', OFFER: '🎁', CREDENTIALS: '🔑', GENERAL: '📢' }

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef(null)
  const navigate = useNavigate()

  const fetchUnread = () => {
    candidatePortalApi.getUnreadCount()
      .then(({ data }) => setUnreadCount(data.count))
      .catch(() => {})
  }

  const fetchNotifications = () => {
    candidatePortalApi.getNotifications()
      .then(({ data }) => setNotifications(data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!open) return
    fetchNotifications()
  }, [open])

  // Fermer si clic dehors
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleMarkAll = async () => {
    await candidatePortalApi.markAllAsRead()
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleClick = async (n) => {
    if (!n.read) {
      await candidatePortalApi.markAsRead(n.id)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    if (n.type === 'STATUS_CHANGE' || n.type === 'INTERVIEW') {
      setOpen(false)
      navigate('/portal/application')
    } else if (n.type === 'OFFER') {
      setOpen(false)
      navigate('/portal/offer')
    }
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                Aucune notification
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${!n.read ? 'bg-blue-50/40' : ''}`}
                >
                  <span className="text-base mt-0.5 flex-shrink-0">{TYPE_ICONS[n.type] || '📢'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${n.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {n.title || n.message}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-600'}`}>
                        {n.type?.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-gray-400">{formatDate(n.createdAt)}</span>
                    </div>
                  </div>
                  {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                  <ChevronRight className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
