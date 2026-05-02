import api from './axiosInstance'

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
}
