import { NavLink } from 'react-router-dom';
import {
  FiHome, FiActivity, FiCalendar,
  FiDollarSign, FiAlertCircle, FiClock, FiBell, FiSettings
} from 'react-icons/fi';
import { GiMedicines } from 'react-icons/gi';

const navItems = [
  { path: '/', icon: <FiHome />, label: 'Dashboard' },
  { path: '/medicines', icon: <GiMedicines />, label: 'Medicines' },
  { path: '/vitals', icon: <FiActivity />, label: 'Vitals' },
  { path: '/appointments', icon: <FiCalendar />, label: 'Appointments' },
  { path: '/expenses', icon: <FiDollarSign />, label: 'Expenses' },
  { path: '/schedule', icon: <FiClock />, label: 'Schedule' },
  { path: '/notifications', icon: <FiBell />, label: 'Notifications' },
  { path: '/emergency', icon: <FiAlertCircle />, label: 'Emergency' },
  { path: '/settings', icon: <FiSettings />, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 py-6">
      <nav className="space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }>
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}