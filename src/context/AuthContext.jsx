import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    });
    const [currentCircle, setCurrentCircle] = useState(() => {
        const saved = localStorage.getItem('currentCircle');
        return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    const refreshAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await API.get('/auth/profile'); 
            const userData = res.data.data || res.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            // Circle එක අලුතින්ම Sync කිරීම
            if (userData.circles && userData.circles.length > 0) {
                const circleId = localStorage.getItem('currentCircleId') || userData.circles[0];
                const circleRes = await API.get(`/circles/${circleId}`);
                const circleData = circleRes.data.data || circleRes.data;
                setCurrentCircle(circleData);
                localStorage.setItem('currentCircle', JSON.stringify(circleData));
                localStorage.setItem('currentCircleId', circleId);
            }
        } catch (error) {
            console.error("Auth Sync Error:", error);
            if (error.response?.status === 401) {
                localStorage.clear();
                setUser(null);
                setCurrentCircle(null);
            }
        } finally {
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
        localStorage.clear();
        setUser(null);
        setCurrentCircle(null);
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