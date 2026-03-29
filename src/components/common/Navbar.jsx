import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiBell, FiLogOut, FiUser, FiMoon, FiSun, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout, currentCircle } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-3 sticky top-0 z-40 transition-all">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl">🏥</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              CareCircle
            </h1>
            {currentCircle && (
              <p className="text-xs text-gray-400 dark:text-gray-500 -mt-0.5">
                {currentCircle.name}
              </p>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Dark Mode */}
          <button onClick={toggleDarkMode}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Notifications */}
          <button onClick={() => navigate('/notifications')}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all relative">
            <FiBell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button onClick={() => navigate('/settings')}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <FiSettings size={18} />
          </button>

          {/* User */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
              {user?.name}
            </span>
          </div>

          {/* Logout */}
          <button onClick={logout}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}