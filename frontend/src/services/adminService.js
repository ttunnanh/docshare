import api from './api';

export const getDashboardStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

export const getAllUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

export const updateUserRole = async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
};

export const getPendingDocuments = async () => {
    const response = await api.get('/admin/documents/pending');
    return response.data;
};

export const updateDocumentStatus = async (id, status) => {
    const response = await api.put(`/admin/documents/${id}/status`, { status });
    return response.data;
};