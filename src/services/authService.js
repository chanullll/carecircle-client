import API from './api';

export const loginUser = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    return data;
};

export const registerUser = async (userData) => {
    const { data } = await API.post('/auth/register', userData);
    return data;
};

export const getProfile = async () => {
    const { data } = await API.get('/auth/profile');
    return data;
};

export const forgotPassword = async (email) => {
    const { data } = await API.post('/auth/forgot-password', { email });
    return data;
};

export const resetPassword = async (token, password) => {
    const { data } = await API.post(`/auth/reset-password/${token}`, { password });
    return data;
};