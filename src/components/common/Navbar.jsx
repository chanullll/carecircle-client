import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiBell, FiLogOut, FiMoon, FiSun, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout, currentCircle } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}>
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.4 }}>
            <span className="text-xl">🏥</span>
          </motion.div>
          <div>
            <h1 className="text-lg font-bold gradient-text">CareCircle</h1>
            {currentCircle && (
              <p className="text-xs text-gray-400 dark:text-gray-500 -mt-0.5">
                {currentCircle.name}
              </p>
            )}
          </div>
        </motion.div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {[
            {
              icon: darkMode ? <FiSun size={18} /> : <FiMoon size={18} />,
              onClick: toggleDarkMode,
              title: 'Toggle theme'
            },
            {
              icon: <FiBell size={18} />,
              onClick: () => navigate('/notifications'),
              badge: true,
              title: 'Notifications'
            },
            {
              icon: <FiSettings size={18} />,
              onClick: () => navigate('/settings'),
              title: 'Settings'
            },
          ].map((btn, i) => (
            <motion.button key={i}
              onClick={btn.onClick}
              title={btn.title}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {btn.icon}
              {btn.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full">
                </motion.span>
              )}
            </motion.button>
          ))}

          {/* User */}
          <motion.div
            className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700"
            whileHover={{ scale: 1.02 }}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
              {user?.name?.split(' ')[0]}
            </span>
          </motion.div>

          {/* Logout */}
          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <FiLogOut size={18} />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}