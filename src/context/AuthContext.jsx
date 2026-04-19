import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentCircle, setCurrentCircle] = useState(null);

    // 🔄 SYNC LOGIC: Backend එකෙන් සැබෑ දත්ත ලබා ගැනීම
    const refreshAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            // 1. User Profile ලබා ගැනීම (Route: /auth/profile)
            const res = await API.get('/auth/profile'); 
            const userData = res.data.data || res.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            // 2. Circle විස්තර ලබා ගැනීම
            if (userData.circles && userData.circles.length > 0) {
                const circleId = localStorage.getItem('currentCircleId') || userData.circles[0];
                const circleRes = await API.get(`/circles/${circleId}`);
                const circleData = circleRes.data.data || circleRes.data;
                setCurrentCircle(circleData);
                localStorage.setItem('currentCircle', JSON.stringify(circleData));
            }
        } catch (error) {
            console.error("Auth Sync Error:", error);
            // යම් හෙයකින් Token එක වලංගු නැතිනම් පමණක් Logout කරන්න
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshAuth();
    }, []);

    const login = (userData, token) => {
        // Token එක සහ User දත්ත මුලින්ම save කරගන්නවා
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        // ඉන්පසු Backend එක සමඟ සම්පූර්ණ Sync එකක් කරනවා
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