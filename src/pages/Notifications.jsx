import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiCheck, FiAlertTriangle,
  FiCalendar, FiDollarSign, FiActivity,
  FiCheckCircle, FiLayers, FiInfo, FiCircle
} from 'react-icons/fi';

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
      const { data } = await API.get(`/notifications/circle/${currentCircle._id}`);
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
      toast.success('Marked as read');
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, readBy: ['me'] } : n)
      );
    } catch (error) {
      toast.error('Failed to mark as read');
    } finally {
      setMarkingId(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.readBy?.length);
      await Promise.all(unread.map(n => API.post(`/notifications/${n._id}/read`)));
      toast.success('All notifications marked as read');
      setNotifications(prev => prev.map(n => ({ ...n, readBy: ['me'] })));
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const getIcon = (type) => {
    const icons = {
      vital_alert: <FiActivity />,
      appointment: <FiCalendar />,
      expense: <FiDollarSign />,
      medicine: <FiLayers />,
      sos: <FiAlertTriangle />,
    };
    return icons[type] || <FiBell />;
  };

  const getThemeColor = (type, severity) => {
    if (type === 'sos' || severity === 'high') return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    if (severity === 'medium') return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.readBy?.length).length;

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold tracking-widest animate-pulse uppercase">Syncing alerts...</div>;

  return (
    <div className="relative min-h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full filter blur-[100px] animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-400/20 dark:bg-sky-600/10 rounded-full filter blur-[100px] animate-pulse delay-700"></div>

      <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h1>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
              {unreadCount > 0 ? `${unreadCount} UNREAD UPDATES` : 'ALL CAUGHT UP'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button 
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:scale-105 active:scale-95 transition-all"
            >
                <FiCheckCircle /> Mark All Read
            </button>
          )}
        </header>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-16 bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl rounded-[3rem] border border-white/20 shadow-xl text-center"
          >
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiBell size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Inbox Zero</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xs mx-auto">
                No new alerts. Your circle activity and health updates will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {notifications.map((notif) => {
                const isRead = notif.readBy?.length > 0;
                const theme = getThemeColor(notif.type, notif.severity);
                
                return (
                  <motion.div
                    key={notif._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`relative p-6 bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-md transition-all ${isRead ? 'opacity-60' : 'ring-1 ring-indigo-500/10'}`}
                  >
                    {!isRead && (
                        <div className="absolute top-6 right-6">
                            <FiCircle className="text-indigo-500 fill-indigo-500" size={8} />
                        </div>
                    )}
                    
                    <div className="flex items-start gap-5">
                      {/* Icon with Dynamic Theme */}
                      <div className={`p-4 rounded-2xl text-2xl border ${theme}`}>
                        {getIcon(notif.type)}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-bold text-lg tracking-tight ${isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            {notif.title}
                          </h3>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                            {getTimeAgo(notif.createdAt)}
                          </span>
                        </div>

                        <p className={`text-sm mt-1 leading-relaxed ${isRead ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                          {notif.message}
                        </p>

                        {/* Footer / Actions */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border ${theme}`}>
                              {notif.severity}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {notif.type.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {!isRead && (
                            <button
                              onClick={() => markAsRead(notif._id)}
                              disabled={markingId === notif._id}
                              className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                            >
                              {markingId === notif._id ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              ) : (
                                <FiCheck />
                              )}
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}