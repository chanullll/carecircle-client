import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { 
  FiClock, FiPlus, FiUsers, FiCopy, FiRefreshCw, FiSunrise, 
  FiSun, FiSunset, FiMoon, FiCpu, FiCalendar, FiAlertTriangle 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

const getShiftDetails = (shift) => {
  const styles = {
    morning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      IconComponent: FiSunrise,
      iconColor: 'text-amber-500',
      time: '6:00 AM - 12:00 PM'
    },
    afternoon: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-700 dark:text-orange-300',
      IconComponent: FiSun,
      iconColor: 'text-orange-500',
      time: '12:00 PM - 6:00 PM'
    },
    evening: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      IconComponent: FiSunset,
      iconColor: 'text-blue-500',
      time: '6:00 PM - 10:00 PM'
    },
    night: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-200 dark:border-indigo-800',
      text: 'text-indigo-700 dark:text-indigo-300',
      IconComponent: FiMoon,
      iconColor: 'text-indigo-500',
      time: '10:00 PM - 6:00 AM'
    }
  };
  return styles[shift] || styles.morning;
};

export default function Schedule() {
  const { currentCircle } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [membersCount, setMembersCount] = useState(0);

  useEffect(() => {
    if (currentCircle?._id) {
      loadSchedule();
      setMembersCount(currentCircle.members?.length || 1);
    } else {
      setLoading(false);
    }
  }, [currentCircle]);

  const loadSchedule = async () => {
    try {
      const { data } = await API.get(`/schedule/circle/${currentCircle._id}`);
      setSchedule(data.data);
    } catch (error) {
      console.error(error);
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = async () => {
    setGenerating(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await API.post('/schedule/generate', {
        circleId: currentCircle._id,
        weekStart: today
      });
      setSchedule(data.data);
      toast.success('Smart schedule generated!');
    } catch (error) {
      toast.error('Failed to generate schedule');
    } finally {
      setGenerating(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(currentCircle.inviteCode);
    toast.success('Invite code copied!');
  };

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full">
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">

      <motion.div {...fadeUp} className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <FiClock className="text-indigo-500" />
            </div>
            Care Schedule
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            AI-powered caregiver shift management
          </p>
        </div>
        <div className="flex gap-2">
          {schedule && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateSchedule}
              disabled={generating}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm font-medium disabled:opacity-50">
              <motion.div
                animate={generating ? { rotate: 360 } : { rotate: 0 }}
                transition={generating ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}>
                <FiRefreshCw size={16} />
              </motion.div>
              Regenerate
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateSchedule}
            disabled={generating}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-medium disabled:opacity-50">
            {generating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full">
                </motion.div>
                Generating...
              </>
            ) : (
              <><FiPlus size={16} /> Generate Schedule</>
            )}
          </motion.button>
        </div>
      </motion.div>

      {membersCount <= 1 && (
        <motion.div
          {...fadeUp}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FiUsers className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-800 dark:text-amber-300 text-lg">
                Only 1 member in your circle!
              </h3>
              <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
                Schedule shows only your name because no other family members have joined.
                Share the invite code to add more caregivers.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Invite Code</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                    {currentCircle.inviteCode}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyInviteCode}
                  className="flex items-center gap-2 bg-amber-500 text-white px-4 py-3 rounded-xl hover:bg-amber-600 font-medium text-sm">
                  <FiCopy size={16} /> Copy Code
                </motion.button>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-3">
                💡 Family members can join by going to Settings → Join with Invite Code
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {!schedule ? (
        <motion.div
          {...fadeUp}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-4">
            <FiCalendar size={60} className="text-gray-400 dark:text-gray-500" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            No schedule yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            AI will automatically assign shifts to family members
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">
            {membersCount <= 1
              ? 'Add more members for better shift distribution'
              : `${membersCount} members ready for scheduling`
            }
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateSchedule}
            disabled={generating}
            className="flex items-center justify-center mx-auto gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-50">
            <FiCpu size={18} />
            {generating ? 'Generating...' : 'Generate Smart Schedule'}
          </motion.button>
        </motion.div>
      ) : (
        <motion.div {...fadeUp} className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <p className="text-indigo-100 text-sm">Week of</p>
            <p className="text-xl font-bold mt-1">
              {new Date(schedule.weekStart).toLocaleDateString('en-LK', {
                weekday: 'long', year: 'numeric',
                month: 'long', day: 'numeric'
              })}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="bg-white/20 rounded-xl px-3 py-1.5">
                <p className="text-xs text-indigo-100">Total Days</p>
                <p className="font-bold">7 days</p>
              </div>
              <div className="bg-white/20 rounded-xl px-3 py-1.5">
                <p className="text-xs text-indigo-100">Shifts/Day</p>
                <p className="font-bold">4 shifts</p>
              </div>
              <div className="bg-white/20 rounded-xl px-3 py-1.5">
                <p className="text-xs text-indigo-100">Caregivers</p>
                <p className="font-bold">{membersCount}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {schedule.schedule?.map((day, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveDay(i)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeDay === i
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isToday(day.date)
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                <p>{day.dayName.slice(0, 3)}</p>
                <p className="text-xs opacity-75">
                  {new Date(day.date).toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })}
                </p>
                {isToday(day.date) && (
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mx-auto mt-1"></div>
                )}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {schedule.schedule?.[activeDay] && (
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                    {schedule.schedule[activeDay].dayName}
                    {isToday(schedule.schedule[activeDay].date) && (
                      <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </h3>
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    {new Date(schedule.schedule[activeDay].date).toLocaleDateString('en-LK', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>

                {schedule.schedule[activeDay].shifts?.map((shift, j) => {
                  const details = getShiftDetails(shift.shift);
                  const { IconComponent } = details;
                  return (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: j * 0.1 }}
                      className={`rounded-2xl border p-4 ${details.bg} ${details.border}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/50 dark:bg-gray-800/30`}>
                            {IconComponent && <IconComponent size={24} className={details.iconColor} />}
                          </div>
                          <div>
                            <p className={`font-bold ${details.text} capitalize`}>
                              {shift.shift} Shift
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                              <FiClock size={12} /> {details.time}
                            </p>
                          </div>
                        </div>

                        {shift.assignedTo ? (
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-8 h-8 bg-white/60 dark:bg-gray-800/40 rounded-xl flex items-center justify-center font-bold text-sm text-gray-700 dark:text-gray-300">
                                {shift.assignedTo.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className={`font-semibold text-sm ${details.text}`}>
                                  {shift.assignedTo.name || 'Member'}
                                </p>
                                {shift.assignedTo.relationship && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                                    {shift.assignedTo.relationship}
                                  </p>
                                )}
                              </div>
                            </div>
                            {shift.autoAssigned && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center justify-end gap-1.5">
                                <FiCpu size={12} /> Auto assigned
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">
                            <FiAlertTriangle size={14} /> Unassigned
                          </span>
                        )}
                      </div>

                      {shift.tasks && shift.tasks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/30 dark:border-gray-700/30">
                          <div className="flex flex-wrap gap-2">
                            {shift.tasks.map((task, k) => (
                              <span key={k}
                                className="text-xs bg-white/60 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-lg">
                                {task}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FiCalendar /> Week Overview
            </h3>
            <div className="space-y-2">
              {schedule.schedule?.map((day, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveDay(i)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    activeDay === i
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isToday(day.date)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {new Date(day.date).getDate()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">
                        {day.dayName}
                        {isToday(day.date) && (
                          <span className="ml-2 text-xs text-indigo-500">Today</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {day.shifts?.length || 0} shifts
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {day.shifts?.map((shift, j) => {
                      const details = getShiftDetails(shift.shift);
                      const { IconComponent } = details;
                      return (
                        <div key={j} title={shift.shift}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${details.bg} border ${details.border}`}>
                          {IconComponent && <IconComponent size={14} className={details.iconColor} />}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}