import api from './api';

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (fullname, email, password) => {
    const response = await api.post('/auth/register', { fullname, email, password });
    return response.data;
};