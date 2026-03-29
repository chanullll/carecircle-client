import API from './api';

export const getMedicines = async (circleId) => {
    const { data } = await API.get(`/medicines/circle/${circleId}`);
    return data;
};

export const addMedicine = async (medicineData) => {
    const { data } = await API.post('/medicines', medicineData);
    return data;
};

export const markGiven = async (logData) => {
    const { data } = await API.post('/medicines/mark-given', logData);
    return data;
};

export const getTodayStatus = async (circleId) => {
    const { data } = await API.get(`/medicines/today/${circleId}`);
    return data;
};