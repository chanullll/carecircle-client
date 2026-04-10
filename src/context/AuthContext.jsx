import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentCircle, setCurrentCircle] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedCircle = localStorage.getItem('currentCircle');
        
        if (savedUser && savedUser !== "undefined") {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        
        if (savedCircle && savedCircle !== "undefined") {
            try {
                setCurrentCircle(JSON.parse(savedCircle));
            } catch (e) {
                localStorage.removeItem('currentCircle');
            }
        }
        
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        // වැදගත්: userData ඇතුළේ token එකත් තියෙනවා නම් ඒක අයින් කරලා පිරිසිදු user object එකක් හදනවා
        const { token: _, ...pureUser } = userData;
        
        setUser(pureUser);
        localStorage.setItem('user', JSON.stringify(pureUser));
        localStorage.setItem('token', token);
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
    };

    return (
        <AuthContext.Provider value={{
            user, login, logout, loading,
            currentCircle, selectCircle, setUser, setCurrentCircle
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);