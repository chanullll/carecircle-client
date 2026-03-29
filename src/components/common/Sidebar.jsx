import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import {
  FiHome, FiActivity, FiCalendar,
  FiDollarSign, FiAlertCircle, FiClock,
  FiBell, FiSettings
} from 'react-icons/fi';
import { GiMedicines } from 'react-icons/gi';

export default function Sidebar() {
  const { currentCircle } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentCircle?._id) loadUnreadCount();
  }, [currentCircle]);

  const loadUnreadCount = async () => {
    try {
      const { data } = await API.get(
        `/notifications/circle/${currentCircle._id}`
      );
      const unread = (data.data || []).filter(
        n => !n.readBy?.length
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error(error);
    }
  };

  const navItems = [
    {
      path: '/',
      icon: <FiHome />,
      label: 'Dashboard',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      path: '/medicines',
      icon: <GiMedicines />,
      label: 'Medicines',
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      path: '/vitals',
      icon: <FiActivity />,
      label: 'Vitals',
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      path: '/appointments',
      icon: <FiCalendar />,
      label: 'Appointments',
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      path: '/expenses',
      icon: <FiDollarSign />,
      label: 'Expenses',
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      path: '/schedule',
      icon: <FiClock />,
      label: 'Schedule',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      path: '/notifications',
      icon: <FiBell />,
      label: 'Notifications',
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      badge: unreadCount
    },
    {
      path: '/emergency',
      icon: <FiAlertCircle />,
      label: 'Emergency',
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
      dot: true
    },
    {
      path: '/settings',
      icon: <FiSettings />,
      label: 'Settings',
      color: 'text-gray-500',
      bg: 'bg-gray-50 dark:bg-gray-800'
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 py-4 transition-colors flex flex-col shadow-sm">
      <nav className="space-y-1 px-3 flex-1">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3 mb-3">
          Main Menu
        </p>

        {navItems.slice(0, 6).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? `${item.bg} ${item.color}`
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }>
            {({ isActive }) => (
              <>
                <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-all ${
                  isActive
                    ? item.bg
                    : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700'
                }`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        <div className="my-3 border-t border-gray-100 dark:border-gray-800"></div>

        <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3 mb-3">
          More
        </p>

        {navItems.slice(6).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? `${item.bg} ${item.color}`
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }>
            {({ isActive }) => (
              <>
                <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-all ${
                  isActive
                    ? item.bg
                    : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700'
                }`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>

                {/* Unread count badge */}
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-bold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}

                {/* Emergency dot */}
                {item.dot && (
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 mt-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 text-center border border-blue-100 dark:border-blue-800/30">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl mx-auto flex items-center justify-center mb-2 shadow-md">
            <span className="text-lg">🏥</span>
          </div>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400">CareCircle v1.0</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Family Care Platform</p>
        </div>
      </div>
    </aside>
  );
}