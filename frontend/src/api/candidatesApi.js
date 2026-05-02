import api from './axiosInstance'

export const candidatesApi = {
  findAll: (search = '') =>
    api.get('/candidates', { params: search ? { search } : {} }),

  findById: (id) => api.get(`/candidates/${id}`),

  create: (data) => api.post('/candidates', data),

  update: (id, data) => api.put(`/candidates/${id}`, data),

  delete: (id) => api.delete(`/candidates/${id}`),

  uploadCv: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/candidates/${id}/cv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  downloadCv: (id) =>
    api.get(`/candidates/${id}/cv`, { responseType: 'blob' }),
}
