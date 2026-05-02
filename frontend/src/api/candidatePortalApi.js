import api from './axiosInstance'

export const candidatePortalApi = {
  getProfile:        ()   => api.get('/candidate/profile'),
  getApplications:   ()   => api.get('/candidate/applications'),
  getApplicationById: (id) => api.get(`/candidate/applications/${id}`),
}
