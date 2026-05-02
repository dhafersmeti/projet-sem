import api from './axiosInstance'

export const interviewsApi = {
  findAll: ()        => api.get('/interviews'),
  findById: (id)     => api.get(`/interviews/${id}`),
  create: (data)     => api.post('/interviews', data),
  update: (id, data) => api.put(`/interviews/${id}`, data),
  delete: (id)       => api.delete(`/interviews/${id}`),
}
