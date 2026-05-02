import api from './axiosInstance'

export const applicationsApi = {
  findAll: ()              => api.get('/applications'),
  findById: (id)           => api.get(`/applications/${id}`),
  create: (data)           => api.post('/applications', data),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
  delete: (id)             => api.delete(`/applications/${id}`),
}
