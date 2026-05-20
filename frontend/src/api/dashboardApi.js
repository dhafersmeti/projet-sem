import api from './axiosInstance'

export const dashboardApi = {
  getStats:          () => api.get('/recruiter/dashboard'),
  updateAppStatus:   (id, status) => api.post(`/recruiter/applications/${id}/status`, { status }),
  createOffer:       (appId, data) => api.post(`/recruiter/applications/${appId}/offer`, data),
  getOfferPdf:       (offerId) => api.get(`/recruiter/offers/${offerId}/pdf`, { responseType: 'blob' }),
  getByPosition:     (posId) => api.get(`/recruiter/applications/by-position/${posId}`),
}
