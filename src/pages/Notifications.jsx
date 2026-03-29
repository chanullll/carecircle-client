import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  FiBell, FiCheck, FiAlertTriangle,
  FiCalendar, FiDollarSign, FiActivity,
  FiCheckCircle, FiTrash2
} from 'react-icons/fi';
import { GiMedicines } from 'react-icons/gi';

export default function Notifications() {
  const { currentCircle } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    if (currentCircle?._id) loadNotifications();
    else setLoading(false);
  }, [currentCircle]);

  const loadNotifications = async () => {
    try {
      const { data } = await API.get(
        `/notifications/circle/${currentCircle._id}`
      );
      setNotifications(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    setMarkingId(id);
    try {
      await API.post(`/notifications/${id}/read`);
      toast.success('Marked as read! ✅');
      // State update - read list එකට add කරනවා
      setNotifications(prev =>
        prev.map(n =>
          n._id === id
            ? { ...n, readBy: [...(n.readBy || []), 'me'] }
            : n
        )
      );
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark as read');
    } finally {
      setMarkingId(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.readBy?.length);
      await Promise.all(unread.map(n => API.post(`/notifications/${n._id}/read`)));
      toast.success('All marked as read! ✅');
      setNotifications(prev =>
        prev.map(n => ({ ...n, readBy: ['me'] }))
      );
    } catch (error) {
      toast.error('Failed to mark all');
    }
  };

  const getIcon = (type) => {
    const icons = {
      vital_alert: <FiActivity className="text-red-500" size={18} />,
      appointment: <FiCalendar className="text-blue-500" size={18} />,
      expense: <FiDollarSign className="text-green-500" size={18} />,
      medicine: <GiMedicines className="text-purple-500" size={18} />,
      sos: <FiAlertTriangle className="text-red-600" size={18} />,
    };
    return icons[type] || <FiBell className="text-gray-500" size={18} />;
  };

  const getIconBg = (type) => {
    const bgs = {
      vital_alert: 'bg-red-100 dark:bg-red-900/30',
      appointment: 'bg-blue-100 dark:bg-blue-900/30',
      expense: 'bg-green-100 dark:bg-green-900/30',
      medicine: 'bg-purple-100 dark:bg-purple-900/30',
      sos: 'bg-red-100 dark:bg-red-900/30',
    };
    return bgs[type] || 'bg-gray-100 dark:bg-gray-700';
  };

  const getSeverityStyle = (severity, isRead) => {
    if (isRead) return 'border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60';
    const styles = {
      high: 'border-l-4 border-red-500 bg-white dark:bg-gray-800',
      medium: 'border-l-4 border-orange-500 bg-white dark:bg-gray-800',
      low: 'border-l-4 border-blue-400 bg-white dark:bg-gray-800',
    };
    return styles[severity] || styles.low;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.readBy?.length).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <FiBell className="text-red-500" />
            </div>
            Notifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up! ✅'
            }
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead}
            className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all text-sm font-medium">
            <FiCheckCircle size={16} /> Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiBell size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            No notifications yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Notifications appear when vitals are recorded,
            medicines are given, etc.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isRead = notif.readBy?.length > 0;
            return (
              <div key={notif._id}
                className={`rounded-2xl shadow-sm p-4 transition-all ${getSeverityStyle(notif.severity, isRead)}`}>
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBg(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`font-semibold text-sm ${
                        isRead
                          ? 'text-gray-500 dark:text-gray-400'
                          : 'text-gray-800 dark:text-white'
                      }`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {getTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className={`text-sm mt-1 ${
                      isRead
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {notif.message}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        notif.severity === 'high'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : notif.severity === 'medium'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {notif.severity}
                      </span>

                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {notif.type.replace(/_/g, ' ')}
                      </span>

                      {/* Mark Read Button */}
                      {!isRead && (
                        <button
                          onClick={() => markAsRead(notif._id)}
                          disabled={markingId === notif._id}
                          className="ml-auto flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium">
                          {markingId === notif._id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                              Marking...
                            </>
                          ) : (
                            <>
                              <FiCheck size={12} /> Mark Read
                            </>
                          )}
                        </button>
                      )}

                      {isRead && (
                        <span className="ml-auto flex items-center gap-1 text-xs text-green-500 dark:text-green-400">
                          <FiCheckCircle size={12} /> Read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}