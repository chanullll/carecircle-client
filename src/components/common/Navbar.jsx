import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiBell, FiLogOut, FiUser, FiMoon, FiSun } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout, currentCircle } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          <div>
            <h1 className="text-xl font-bold text-blue-600">CareCircle</h1>
            {currentCircle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentCircle.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          <button onClick={() => navigate('/notifications')}
            className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600">
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <FiUser size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.name}
            </span>
          </div>

          <button onClick={logout}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}