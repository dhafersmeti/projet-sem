const STATUS_STYLES = {
  // Candidatures
  PENDING:   'bg-yellow-100 text-yellow-800',
  INTERVIEW: 'bg-blue-100 text-blue-800',
  ACCEPTED:  'bg-green-100 text-green-800',
  REJECTED:  'bg-red-100 text-red-800',
  // Offres
  OPEN:      'bg-emerald-100 text-emerald-800',
  CLOSED:    'bg-gray-100 text-gray-800',
}

const STATUS_LABELS = {
  PENDING:   'En attente',
  INTERVIEW: 'Entretien',
  ACCEPTED:  'Accepté',
  REJECTED:  'Refusé',
  OPEN:      'Ouverte',
  CLOSED:    'Fermée',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}
