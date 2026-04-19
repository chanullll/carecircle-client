import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // මුලින්ම loading true වේ
    const [currentCircle, setCurrentCircle] = useState(null);

    const refreshAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            // 1. User Profile ලබා ගැනීම
            const res = await API.get('/auth/profile'); 
            const userData = res.data.data || res.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            // 2. Circle විස්තර ලබා ගැනීම
            // මෙහිදී මුලින්ම බලනවා කලින් තෝරාගත් circle එකක් තියෙනවද කියලා
            let circleId = localStorage.getItem('currentCircleId');
            
            // නැත්නම් user ගේ පළමු circle එක ගන්නවා
            if (!circleId && userData.circles && userData.circles.length > 0) {
                circleId = userData.circles[0];
            }

            if (circleId) {
                const circleRes = await API.get(`/circles/${circleId}`);
                const circleData = circleRes.data.data || circleRes.data;
                setCurrentCircle(circleData);
                localStorage.setItem('currentCircle', JSON.stringify(circleData));
                localStorage.setItem('currentCircleId', circleId);
            }
        } catch (error) {
            console.error("Auth Sync Error:", error);
            if (error.response?.status === 401) logout();
        } finally {
            // සියලුම දත්ත load වූ පසු පමණක් loading false කරයි
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshAuth();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        refreshAuth(); 
    };

    const logout = () => {
        setUser(null);
        setCurrentCircle(null);
        localStorage.clear();
        window.location.href = '/login';
    };

    const selectCircle = (circle) => {
        setCurrentCircle(circle);
        localStorage.setItem('currentCircle', JSON.stringify(circle));
        localStorage.setItem('currentCircleId', circle._id);
    };

    return (
        <AuthContext.Provider value={{
            user, login, logout, loading,
            currentCircle, selectCircle, refreshAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);