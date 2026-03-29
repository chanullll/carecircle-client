import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Vitals from './pages/Vitals';
import Appointments from './pages/Appointments';
import Expenses from './pages/Expenses';
import Schedule from './pages/Schedule';
import Emergency from './pages/Emergency';
import CircleSetup from './pages/CircleSetup';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Loading from './components/common/Loading';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user, loading, currentCircle } = useAuth();
  if (loading) return <Loading />;

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      {user ? (
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6 overflow-auto">
              <Routes>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/medicines" element={<ProtectedRoute><Medicines /></ProtectedRoute>} />
                <Route path="/vitals" element={<ProtectedRoute><Vitals /></ProtectedRoute>} />
                <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
                <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
                <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
                <Route path="/setup" element={<ProtectedRoute><CircleSetup /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}