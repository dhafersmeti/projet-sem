const STATUS_CONFIG = {
  RECEIVED:     { label: 'Reçu',        cls: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'          },
  UNDER_REVIEW: { label: 'En examen',   cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'    },
  INTERVIEW:    { label: 'Entretien',   cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'       },
  EVALUATION:   { label: 'Évaluation',  cls: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' },
  ACCEPTED:     { label: 'Accepté',     cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  REJECTED:     { label: 'Refusé',      cls: 'bg-red-50 text-red-700 ring-1 ring-red-200'          },
  PUBLISHED:    { label: 'Publiée',     cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  DRAFT:        { label: 'Brouillon',   cls: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'      },
  CLOSED:       { label: 'Fermée',      cls: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'      },
  OPEN:         { label: 'Ouverte',     cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  PENDING:      { label: 'En attente',  cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'    },
  SENT:         { label: 'Envoyée',     cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'       },
  PLANNED:      { label: 'Planifié',    cls: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'          },
  COMPLETED:    { label: 'Terminé',     cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  CANCELLED:    { label: 'Annulé',      cls: 'bg-red-50 text-red-700 ring-1 ring-red-200'          },
}

const DOT_COLOR = {
  RECEIVED: 'bg-sky-400', UNDER_REVIEW: 'bg-amber-400',
  INTERVIEW: 'bg-blue-500', EVALUATION: 'bg-violet-500',
  ACCEPTED: 'bg-emerald-500', REJECTED: 'bg-red-500',
  PUBLISHED: 'bg-emerald-500', DRAFT: 'bg-gray-400', CLOSED: 'bg-gray-400',
}

export default function StatusBadge({ status, dot = true }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLOR[status] || 'bg-gray-400'}`} />}
      {cfg.label}
    </span>
  )
}
