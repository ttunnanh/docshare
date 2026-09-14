import api from './api';

export const getAllDocuments = async (page = 1, limit = 10, keyword = '', category_id = '') => {
    let url = `/documents?page=${page}&limit=${limit}`;
    if (keyword) url += `&keyword=${keyword}`;
    if (category_id) url += `&category_id=${category_id}`;
    const response = await api.get(url);
    return response.data;
};

export const downloadDocument = async (id) => {
    const response = await api.get(`/documents/${id}/download`);
    return response.data;
};

export const uploadDocument = async (formData) => {
    const response = await api.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getPendingDocuments = async () => {
    const response = await api.get('/documents/pending');
    return response.data;
};

export const approveDocument = async (id, status) => {
    const response = await api.put(`/documents/${id}/approve`, { status });
    return response.data;
};

export const updateDocument = async (id, updateData) => {
    const response = await api.put(`/documents/${id}`, updateData);
    return response.data;
};

export const deleteDocument = async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
};

export const getDownloadUrl = async (id) => {
    const response = await api.get(`/documents/${id}/download`);
    return response.data;
};
export const getAllForAdmin = async () => {
    const response = await api.get('/documents/admin/all');
    return response.data;
};
export const getDocumentById = async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
};