import { Check, X } from 'lucide-react'

const STEPS = [
  { key: 'RECEIVED',     label: 'Reçu'        },
  { key: 'UNDER_REVIEW', label: 'En examen'   },
  { key: 'INTERVIEW',    label: 'Entretien'   },
  { key: 'EVALUATION',   label: 'Évaluation'  },
  { key: 'ACCEPTED',     label: 'Décision'    },
]

const STATUS_ORDER = {
  RECEIVED: 0, UNDER_REVIEW: 1, INTERVIEW: 2, EVALUATION: 3, ACCEPTED: 4, REJECTED: 4,
}

export default function Pipeline({ currentStatus }) {
  const currentIdx = STATUS_ORDER[currentStatus] ?? -1
  const isRejected = currentStatus === 'REJECTED'

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center min-w-max px-2 py-4">
        {STEPS.map((step, idx) => {
          const done    = idx < currentIdx
          const active  = idx === currentIdx
          const future  = idx > currentIdx
          const rejected = isRejected && idx === 4

          return (
            <div key={step.key} className="flex items-center">
              {/* Cercle étape */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-300 shadow-sm
                  ${done    ? 'bg-emerald-500 text-white ring-2 ring-emerald-200' : ''}
                  ${active && !isRejected ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110' : ''}
                  ${rejected ? 'bg-red-500 text-white ring-4 ring-red-100 scale-110' : ''}
                  ${future   ? 'bg-gray-100 text-gray-400 ring-1 ring-gray-200' : ''}
                `}>
                  {done ? (
                    <Check className="w-5 h-5" />
                  ) : rejected ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className={`
                  mt-2 text-xs font-medium whitespace-nowrap
                  ${done             ? 'text-emerald-600' : ''}
                  ${active && !isRejected ? 'text-indigo-700 font-semibold' : ''}
                  ${rejected         ? 'text-red-600 font-semibold' : ''}
                  ${future           ? 'text-gray-400' : ''}
                `}>
                  {rejected && idx === 4 ? 'Refusé' : step.label}
                </span>
              </div>

              {/* Connecteur */}
              {idx < STEPS.length - 1 && (
                <div className={`
                  h-1 w-16 mx-1 rounded-full transition-all duration-300
                  ${idx < currentIdx ? 'bg-emerald-400' : 'bg-gray-200'}
                `} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
