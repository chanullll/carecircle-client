import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentCircle, setCurrentCircle] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedCircle = localStorage.getItem('currentCircle');
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedCircle) setCurrentCircle(JSON.parse(savedCircle));
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);
    };

    const logout = () => {
        setUser(null);
        setCurrentCircle(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('currentCircle');
    };

    const selectCircle = (circle) => {
        setCurrentCircle(circle);
        localStorage.setItem('currentCircle', JSON.stringify(circle));
    };

    return (
        <AuthContext.Provider value={{
            user, login, logout, loading,
            currentCircle, selectCircle
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);