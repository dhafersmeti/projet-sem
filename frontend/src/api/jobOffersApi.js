import api from './axiosInstance'

export const jobOffersApi = {
  findAll: ()        => api.get('/job-offers'),
  findById: (id)     => api.get(`/job-offers/${id}`),
  create: (data)     => api.post('/job-offers', data),
  update: (id, data) => api.put(`/job-offers/${id}`, data),
  delete: (id)       => api.delete(`/job-offers/${id}`),
}
