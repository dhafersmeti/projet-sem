import api from './axiosInstance'

export const candidatePortalApi = {
  getProfile:     () => api.get('/candidate/me'),
  updateProfile:  (data) => api.put('/candidate/me', data),
  uploadCv: (file) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post('/candidate/me/cv', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getApplication:     () => api.get('/candidate/me/application'),
  getApplications:    () => api.get('/candidate/applications'),
  getApplicationById: (id) => api.get(`/candidate/applications/${id}`),
  getInterviews:  () => api.get('/candidate/me/interviews'),
  getOffer:       () => api.get('/candidate/me/offer'),
  acceptOffer:    () => api.post('/candidate/me/offer/accept'),
  rejectOffer:    () => api.post('/candidate/me/offer/reject'),
  getJobOffers:   () => api.get('/candidate/job-offers'),
  applyToOffer:   (id) => api.post(`/candidate/job-offers/${id}/apply`),
  getNotifications: () => api.get('/candidate/me/notifications'),
  getUnreadCount: () => api.get('/candidate/notifications/unread-count'),
  markAsRead:     (id) => api.put(`/candidate/me/notifications/${id}/read`),
  markAllAsRead:  () => api.put('/candidate/notifications/read-all'),
}
