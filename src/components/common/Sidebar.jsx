import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  FiHome, FiActivity, FiCalendar, FiDollarSign, 
  FiClock, FiBell, FiSettings, FiLogOut, FiLayers
} from 'react-icons/fi';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu items configuration
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/medicines', label: 'Medicines', icon: FiLayers },
    { path: '/vitals', label: 'Health Vitals', icon: FiActivity },
    { path: '/schedule', label: 'Care Schedule', icon: FiClock },
    { path: '/appointments', label: 'Appointments', icon: FiCalendar },
    { path: '/expenses', label: 'Expenses', icon: FiDollarSign },
    { path: '/notifications', label: 'Notifications', icon: FiBell },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-r border-slate-200/60 dark:border-slate-700/50 min-h-[calc(100vh-64px)] transition-colors duration-300">
      
      {/* Navigation Links */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group overflow-hidden ${
                  isActive 
                    ? 'bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700' 
                    : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div 
                    layoutId="activeSidebarIndicator"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full"
                  />
                )}

                {/* Icon */}
                <div className={`transition-colors duration-300 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'
                }`}>
                  <item.icon size={20} />
                </div>

                {/* Label */}
                <span className={`text-sm tracking-wide transition-colors duration-300 ${
                  isActive 
                    ? 'font-bold text-slate-900 dark:text-white' 
                    : 'font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                }`}>
                  {item.label}
                </span>

              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Section (Settings & Logout) */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/50 space-y-1.5 bg-white/20 dark:bg-slate-900/20">
        
        {/* Settings */}
        <Link to="/settings">
          <motion.div
            whileHover={{ x: 4 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
              location.pathname === '/settings'
                ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700'
                : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <FiSettings size={20} className={location.pathname === '/settings' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
            <span className={`text-sm tracking-wide ${location.pathname === '/settings' ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}>
              Settings
            </span>
          </motion.div>
        </Link>

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <FiLogOut size={20} className="text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
          <span className="text-sm tracking-wide font-medium text-slate-500 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            Sign Out
          </span>
        </motion.button>
      </div>

    </aside>
  );
}