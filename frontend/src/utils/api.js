import axios from 'axios';

// const api = axios.create({ baseURL: '/api' });

const api = axios.create({
  baseURL: 'https://consulttrackproject.onrender.com/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Consultations
export const getConsultations = (params) => api.get('/consultations', { params });
export const getConsultation = (id) => api.get(`/consultations/${id}`);
export const createConsultation = (data) => api.post('/consultations', data);
export const updateConsultation = (id, data) => api.put(`/consultations/${id}`, data);
export const deleteConsultation = (id) => api.delete(`/consultations/${id}`);
export const getStats = () => api.get('/consultations/stats');
export const uploadAttachment = (id, formData) =>
  api.post(`/consultations/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Clients
export const getClients = (params) => api.get('/clients', { params });
export const getClient = (id) => api.get(`/clients/${id}`);
export const createClient = (data) => api.post('/clients', data);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}`);

// Recordings
export const uploadRecording = (consultationId, formData) =>
  api.post(`/recordings/${consultationId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteRecording = (consultationId, recordingId) =>
  api.delete(`/recordings/${consultationId}/${recordingId}`);

export default api;
