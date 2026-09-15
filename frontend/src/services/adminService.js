import api from './api';

export const getDashboardStats = () => api.get('/admin/stats').then((r) => r.data);
export const getAllUsers = () => api.get('/admin/users').then((r) => r.data);
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role }).then((r) => r.data);
export const updateUserStatus = (id, isActive) => api.patch(`/admin/users/${id}/status`, { is_active: isActive }).then((r) => r.data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`).then((r) => r.data);
export const getPendingDocuments = () => api.get('/admin/documents/pending').then((r) => r.data);
export const setDocumentStatus = (id, status, rejectionReason = '') => api.put(`/admin/documents/${id}/status`, {
  status,
  rejection_reason: rejectionReason,
}).then((r) => r.data);
export const getAuditLogs = (params = {}) => api.get('/admin/audit-logs', { params }).then((r) => r.data);
