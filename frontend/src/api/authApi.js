import api from './axiosInstance'

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  candidateRegister: (data) => api.post('/auth/candidate/register', data),
}
