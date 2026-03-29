import API from './api';

export const addVital = async (vitalData) => {
    const { data } = await API.post('/vitals', vitalData);
    return data;
};

export const getVitals = async (circleId) => {
    const { data } = await API.get(`/vitals/circle/${circleId}`);
    return data;
};

export const getLatestVital = async (circleId) => {
    const { data } = await API.get(`/vitals/latest/${circleId}`);
    return data;
};

export const getHealthScore = async (circleId) => {
    const { data } = await API.get(`/health/score/${circleId}`);
    return data;
};