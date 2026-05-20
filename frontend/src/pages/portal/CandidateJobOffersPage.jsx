import { useEffect, useState } from 'react'
import { candidatePortalApi } from '../../api/candidatePortalApi'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import Spinner from '../../components/Spinner'
import { Briefcase, CheckCircle, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CandidateJobOffersPage() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)

  useEffect(() => {
    candidatePortalApi.getJobOffers()
      .then(({ data }) => setOffers(data))
      .finally(() => setLoading(false))
  }, [])

  const handleApply = async (offer) => {
    setApplying(offer.id)
    try {
      await candidatePortalApi.applyToOffer(offer.id)
      toast.success(`Candidature envoyée pour "${offer.title}"`)
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, alreadyApplied: true } : o))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la candidature')
    } finally {
      setApplying(null)
    }
  }

  const openOffers   = offers.filter(o => o.status === 'OPEN')
  const closedOffers = offers.filter(o => o.status === 'CLOSED')

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Offres d'emploi</h1>
          <span className="text-sm text-gray-500">
            {openOffers.length} offre{openOffers.length !== 1 ? 's' : ''} ouverte{openOffers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : offers.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>Aucune offre disponible pour le moment</p>
          </div>
        ) : (
          <>
            {openOffers.length > 0 && (
              <div className="space-y-4">
                {openOffers.map(offer => (
                  <OfferCard key={offer.id} offer={offer} onApply={handleApply} applying={applying} />
                ))}
              </div>
            )}

            {closedOffers.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Offres clôturées</h2>
                {closedOffers.map(offer => (
                  <OfferCard key={offer.id} offer={offer} onApply={handleApply} applying={applying} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

function OfferCard({ offer, onApply, applying }) {
  const isClosed  = offer.status === 'CLOSED'
  const isApplied = offer.alreadyApplied
  const isApplying = applying === offer.id

  return (
    <div className={`card transition-all ${isClosed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-gray-900">{offer.title}</h2>
            <StatusBadge status={offer.status} />
            {isApplied && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" />
                Postulé
              </span>
            )}
          </div>

          {offer.datePosted && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
              <Calendar className="w-3 h-3" />
              Publiée le {new Date(offer.datePosted).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          )}

          {offer.description && (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-4">
              {offer.description}
            </p>
          )}
        </div>

        <div className="flex-shrink-0">
          {isApplied ? (
            <button
              disabled
              className="px-4 py-2 text-sm rounded-lg bg-green-50 text-green-600 font-medium cursor-not-allowed"
            >
              Déjà postulé
            </button>
          ) : (
            <button
              onClick={() => onApply(offer)}
              disabled={isClosed || isApplying}
              className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isApplying ? 'Envoi...' : isClosed ? 'Clôturée' : 'Postuler'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
