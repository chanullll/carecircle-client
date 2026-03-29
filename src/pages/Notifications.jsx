import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { FiBell, FiCheck, FiAlertTriangle, FiCalendar, FiDollarSign, FiActivity } from 'react-icons/fi';
import { GiMedicines } from 'react-icons/gi';

export default function Notifications() {
  const { currentCircle } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentCircle?._id) loadNotifications();
    else setLoading(false);
  }, [currentCircle]);

  const loadNotifications = async () => {
    try {
      const { data } = await API.get(`/notifications/circle/${currentCircle._id}`);
      setNotifications(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.post(`/notifications/${id}/read`);
      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'vital_alert': return <FiActivity className="text-red-500" size={20} />;
      case 'appointment': return <FiCalendar className="text-blue-500" size={20} />;
      case 'expense': return <FiDollarSign className="text-green-500" size={20} />;
      case 'medicine': return <GiMedicines className="text-purple-500" size={20} />;
      case 'sos': return <FiAlertTriangle className="text-red-600" size={20} />;
      default: return <FiBell className="text-gray-500" size={20} />;
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50';
      case 'medium': return 'border-l-4 border-orange-500 bg-orange-50';
      default: return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiBell className="text-blue-500" /> Notifications
        </h1>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
          {notifications.length} total
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-4xl mb-4">🔔</p>
          <p className="text-gray-500 text-lg">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Notifications will appear when vitals are recorded, medicines are given, etc.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => (
            <div key={i} className={`rounded-xl shadow p-4 ${getSeverityStyle(notif.severity)}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">{getIcon(notif.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800">{notif.title}</h3>
                    <span className="text-xs text-gray-400">{getTimeAgo(notif.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      notif.severity === 'high' ? 'bg-red-100 text-red-700' :
                      notif.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {notif.severity}
                    </span>
                    <span className="text-xs text-gray-400">{notif.type.replace('_', ' ')}</span>
                    <button onClick={() => markAsRead(notif._id)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <FiCheck size={14} /> Mark read
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}