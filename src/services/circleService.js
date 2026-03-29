import API from './api';

export const createCircle = async (circleData) => {
    const { data } = await API.post('/circles', circleData);
    return data;
};

export const getMyCircles = async () => {
    const { data } = await API.get('/circles/my');
    return data;
};

export const joinCircle = async (inviteCode, relationship) => {
    const { data } = await API.post('/circles/join', { inviteCode, relationship });
    return data;
};