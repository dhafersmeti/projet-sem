import StatusBadge from './StatusBadge'

const STATUS_LABEL = {
  RECEIVED: 'Reçu', UNDER_REVIEW: 'En examen', INTERVIEW: 'Entretien',
  EVALUATION: 'Évaluation', ACCEPTED: 'Accepté', REJECTED: 'Refusé',
}

export default function Timeline({ history = [] }) {
  if (!history.length) return (
    <p className="text-sm text-gray-400 italic py-4">Aucun historique disponible.</p>
  )

  return (
    <ol className="relative border-l-2 border-gray-200 ml-3 space-y-4">
      {history.map((entry, i) => (
        <li key={i} className="ml-6">
          <span className="absolute -left-2.5 w-5 h-5 rounded-full ring-2 ring-white bg-indigo-500 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-white" />
          </span>
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              {entry.oldStatus && (
                <>
                  <StatusBadge status={entry.oldStatus} dot={false} />
                  <span className="text-gray-400 text-xs">→</span>
                </>
              )}
              <StatusBadge status={entry.newStatus} dot={false} />
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
              {entry.changedAt && (
                <span>{new Date(entry.changedAt).toLocaleString('fr-FR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}</span>
              )}
              {entry.changedBy && entry.changedBy !== 'system' && (
                <span className="text-gray-300">·</span>
              )}
              {entry.changedBy && entry.changedBy !== 'system' && (
                <span className="text-indigo-500">{entry.changedBy}</span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
