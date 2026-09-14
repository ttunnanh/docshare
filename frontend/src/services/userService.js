import api from './api';

export const getProfile = async () => {
    const response = await api.get('/users/profile');
    return response.data;
};

export const getMyUploads = async () => {
    // Sửa lại endpoint để khớp với router.get('/uploads') ở backend
    const response = await api.get('/users/uploads');
    return response.data;
};

export const getMyDownloads = async () => {
    const response = await api.get('/users/downloads');
    return response.data;
};

export const updateProfile = async (fullname) => {
    const response = await api.put('/users/profile', { fullname });
    return response.data;
};

export const changePassword = async (oldPassword, newPassword) => {
    const response = await api.put('/users/password', { oldPassword, newPassword });
    return response.data;
};