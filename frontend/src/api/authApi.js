import api from './axiosInstance'

export const authApi = {
  login:           (credentials) => api.post('/auth/login', credentials),
  changePassword:  (data)        => api.post('/auth/change-password', data),
}
