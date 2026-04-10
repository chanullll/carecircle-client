import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiBell, FiMenu, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user } = useAuth();
  // FIXED: Using the correct context names from ThemeContext.jsx
  const { darkMode, toggleDarkMode } = useTheme();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/60 dark:border-slate-700/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]"> {/* Increased height for more breathing room */}
          
          {/* Left: Brand & Mobile Menu */}
          <div className="flex items-center gap-5"> {/* Increased gap */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <FiMenu size={24} />
            </motion.button>

            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: [0, -10, 10, 0] }}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <FiHeart className="text-white text-lg relative z-10" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  Care<span className="text-blue-600 dark:text-blue-400">Circle</span>
                </h1>
              </div>
            </Link>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-6"> {/* MUCH larger gap: gap-6 (24px) for minimalist look */}
            
            {/* Theme Toggle Button (Minimalist, no background box) */}
            <motion.button
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              className="relative text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="Toggle Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {darkMode ? (
                  <motion.div
                    key="moon"
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiMoon size={22} /> {/* Slightly larger icons */}
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiSun size={22} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notifications Button (Minimalist) */}
            <Link to="/notifications">
              <motion.button
                whileHover={{ scale: 1.1, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
                className="relative text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <FiBell size={22} />
                {/* Red dot indicator positioned cleanly */}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900" />
              </motion.button>
            </Link>

            {/* Delicate Divider */}
            <div className="hidden sm:block w-[1px] h-6 bg-slate-200 dark:bg-slate-700" />

            {/* User Profile (Spaced out properly) */}
            <Link to="/settings" className="flex items-center gap-3 group cursor-pointer">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {user?.name?.split(' ')[0] || 'User'}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1 leading-none">
                  {user?.role || 'Member'}
                </p>
              </div>
              
              <div className="relative">
                {/* Avatar with very subtle ring on hover */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 group-hover:ring-2 ring-blue-500/30 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 transition-all">
                  {getInitials(user?.name)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>
            </Link>

          </div>
        </div>
      </div>
    </header>
  );
}