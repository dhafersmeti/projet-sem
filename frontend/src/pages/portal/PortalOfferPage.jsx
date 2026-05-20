import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import { candidatePortalApi } from '../../api/candidatePortalApi'
import { Gift, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PortalOfferPage() {
  const [offer, setOffer]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing]   = useState(false)

  useEffect(() => {
    candidatePortalApi.getOffer()
      .then(({ data }) => setOffer(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAction = async (action) => {
    setActing(true)
    try {
      const { data } = action === 'accept'
        ? await candidatePortalApi.acceptOffer()
        : await candidatePortalApi.rejectOffer()
      setOffer(data)
      toast.success(action === 'accept' ? 'Offre acceptée !' : 'Offre refusée')
    } catch { toast.error('Erreur lors de la réponse') }
    finally { setActing(false) }
  }

  if (loading) return <Layout><div className="flex justify-center py-20"><Spinner /></div></Layout>

  if (!offer) return (
    <Layout>
      <EmptyState icon={Gift} title="Aucune offre d'embauche" description="Votre offre d'embauche apparaîtra ici une fois générée par le recruteur." />
    </Layout>
  )

  const isPending = offer.status === 'PENDING' || offer.status === 'SENT'
  const isAccepted = offer.status === 'ACCEPTED'
  const isRejected = offer.status === 'REJECTED'

  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mon offre d'embauche</h1>
          <StatusBadge status={offer.status} />
        </div>

        <div className="card space-y-4">
          {isAccepted && (
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
              <p className="text-emerald-700 font-semibold">🎉 Félicitations ! Vous avez accepté cette offre.</p>
            </div>
          )}
          {isRejected && (
            <div className="bg-red-50 rounded-xl p-3 border border-red-100 text-center">
              <p className="text-red-700 font-medium">Vous avez refusé cette offre.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Poste</p>
              <p className="font-semibold text-gray-900">{offer.position}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Candidat</p>
              <p className="font-semibold text-gray-900">{offer.candidateName}</p>
            </div>
            {offer.salary && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Salaire</p>
                <p className="font-semibold text-emerald-700">{offer.salary.toLocaleString()} TND/mois</p>
              </div>
            )}
            {offer.startDate && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Date de début</p>
                <p className="font-semibold text-gray-900">
                  {new Date(offer.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>

          {offer.benefits && (
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Avantages</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{offer.benefits}</p>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Générée le {offer.generatedAt
              ? new Date(offer.generatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
              : '—'}
          </p>

          {isPending && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleAction('accept')}
                disabled={acting}
                className="flex-1 btn-primary gap-2 justify-center"
              >
                <Check className="w-4 h-4" /> Accepter l'offre
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={acting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
              >
                <X className="w-4 h-4" /> Refuser
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
