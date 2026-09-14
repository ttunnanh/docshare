import api from './api';

export const getDashboardStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

export const getPendingDocuments = async () => {
    const response = await api.get('/admin/documents/pending');
    return response.data;
};

export const approveDocument = async (id) => {
    const response = await api.put(`/admin/documents/${id}/status`, { status: 'approved' });
    return response.data;
};

export const rejectDocument = async (id) => {
    const response = await api.put(`/admin/documents/${id}/status`, { status: 'rejected' });
    return response.data;
};

export const getAllUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};

export const updateUserRole = async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
};