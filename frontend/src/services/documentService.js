import api from './api';

export const getDocuments = (params = {}) => api.get('/documents', { params }).then((r) => r.data);
export const getPublicStats = () => api.get('/documents/stats/public').then((r) => r.data);
export const getDocument = (id) => api.get(`/documents/${id}`).then((r) => r.data);
export const uploadDocument = (form) => api.post('/documents/upload', form).then((r) => r.data);
export const updateDocument = (id, data) => api.put(`/documents/${id}`, data).then((r) => r.data);
export const deleteDocument = (id) => api.delete(`/documents/${id}`).then((r) => r.data);
export const downloadDocument = (id) => api.get(`/documents/${id}/download`).then((r) => r.data);
export const toggleSave = (id) => api.post(`/documents/${id}/save`).then((r) => r.data);
export const getSaved = () => api.get('/documents/saved/user').then((r) => r.data);
export const getAllAdmin = () => api.get('/documents/admin/all').then((r) => r.data);
