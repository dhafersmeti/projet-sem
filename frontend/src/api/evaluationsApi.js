import api from './axiosInstance'

export const evaluationsApi = {
  create: (data)             => api.post('/evaluations', data),
  findByInterview: (interviewId) => api.get(`/evaluations/interview/${interviewId}`),
}
