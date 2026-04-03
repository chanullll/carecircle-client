import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTodayStatus } from '../services/medicineService';
import { getLatestVital, getHealthScore } from '../services/vitalService';
import { FiActivity, FiAlertCircle, FiPlus, FiClock, FiArrowRight } from 'react-icons/fi';
import { GiMedicines } from 'react-icons/gi';
import { formatTime } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
};

export default function Dashboard() {
  const { user, currentCircle } = useAuth();
  const navigate = useNavigate();
  const [todayMeds, setTodayMeds] = useState([]);
  const [latestVital, setLatestVital] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [stats, setStats] = useState({ given: 0, pending: 0, missed: 0 });
  const [loading, setLoading] = useState(false);
  const [nextMedicine, setNextMedicine] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (currentCircle?._id) loadDashboard();
  }, [currentCircle]);

  useEffect(() => {
    if (!nextMedicine) return;
    const interval = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = nextMedicine.time.split(':').map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const diff = target - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextMedicine]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const medsData = await getTodayStatus(currentCircle._id);
      setTodayMeds(medsData.data || []);

      let given = 0, pending = 0, missed = 0;
      const pendingMeds = [];
      (medsData.data || []).forEach(med => {
        med.times.forEach(t => {
          if (t.status === 'given') given++;
          else if (t.status === 'missed') missed++;
          else {
            pending++;
            pendingMeds.push({ name: med.medicine.name, time: t.time });
          }
        });
      });
      setStats({ given, pending, missed });

      if (pendingMeds.length > 0) {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const sorted = pendingMeds
          .map(m => {
            const [h, min] = m.time.split(':').map(Number);
            return { ...m, totalMinutes: h * 60 + min };
          })
          .sort((a, b) => a.totalMinutes - b.totalMinutes);
        setNextMedicine(sorted.find(m => m.totalMinutes > nowMinutes) || sorted[0]);
      }

      try {
        const vitalData = await getLatestVital(currentCircle._id);
        setLatestVital(vitalData.data);
      } catch (e) {}

      try {
        const scoreData = await getHealthScore(currentCircle._id);
        setHealthScore(scoreData.data);
      } catch (e) {}

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentCircle) {
    return (
      <motion.div
        {...fadeUp}
        className="flex flex-col items-center justify-center h-64 space-y-4">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl">
          👨‍👩‍👧‍👦
        </motion.div>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
          No family circle found!
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/setup')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-md">
          <FiPlus /> Create Family Circle
        </motion.button>
      </motion.div>
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full">
      </motion.div>
    </div>
  );

  const greeting = new Date().getHours() < 12 ? 'Good Morning' :
    new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-6 max-w-7xl">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {new Date().toLocaleDateString('en-LK', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium cursor-pointer"
              onClick={() => navigate('/settings')}>
              🏠 {currentCircle.name}
            </motion.span>
            <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
              👤 {currentCircle.patient?.name}
            </span>
          </div>
        </div>

        <motion.button
          onClick={() => navigate('/emergency')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="sos-pulse bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
          🆘 SOS
        </motion.button>
      </motion.div>

      {/* Next Medicine */}
      <AnimatePresence>
        {nextMedicine && (
          <motion.div
            variants={fadeUp}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-r from-violet-500 via-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
              style={{
                background: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }} />
            <div className="flex justify-between items-center relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>
                    <FiClock size={16} className="text-purple-200" />
                  </motion.div>
                  <p className="text-purple-200 text-sm font-medium">Next Medicine</p>
                </div>
                <p className="text-2xl font-bold">💊 {nextMedicine.name}</p>
                <p className="text-purple-200 text-sm mt-1">
                  at {formatTime(nextMedicine.time)}
                </p>
              </div>
              <div className="text-right bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-purple-200 text-xs mb-1">Time remaining</p>
                <motion.p
                  key={countdown}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold font-mono">
                  {countdown}
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Given', value: stats.given, icon: '✅', gradient: 'from-green-400 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
          { label: 'Pending', value: stats.pending, icon: '⏳', gradient: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Missed', value: stats.missed, icon: '❌', gradient: 'from-red-400 to-rose-500', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
          healthScore ? {
            label: 'Health Score',
            value: healthScore.healthScore,
            icon: '🤖',
            gradient: healthScore.healthScore >= 80 ? 'from-blue-400 to-indigo-500' : 'from-orange-400 to-amber-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            text: 'text-blue-600 dark:text-blue-400',
            sub: healthScore.grade
          } : null
        ].filter(Boolean).map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ y: -4, shadow: 'lg' }}
            className={`${stat.bg} rounded-2xl p-5 border border-white/50 dark:border-gray-700/50 shadow-sm card-hover cursor-pointer`}>
            <div className="flex justify-between items-start mb-3">
              <motion.span
                className="text-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
                {stat.icon}
              </motion.span>
              <span className={`text-xs font-medium ${stat.text} bg-white/60 dark:bg-gray-800/60 px-2 py-0.5 rounded-full`}>
                {stat.label}
              </span>
            </div>
            <p className={`text-4xl font-bold ${stat.text}`}>{stat.value}</p>
            {stat.sub && (
              <p className={`text-xs ${stat.text} mt-1 opacity-75`}>{stat.sub}</p>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Health Alerts */}
      <AnimatePresence>
        {healthScore?.risks?.length > 0 && (
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <FiAlertCircle className="text-red-500" />
                </motion.div>
                AI Health Alerts
              </h2>
              <button onClick={() => navigate('/vitals')}
                className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                View Details <FiArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {healthScore.risks.map((risk, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    risk.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                    risk.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' :
                    'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                  }`}>
                  <span>{risk.severity === 'critical' ? '🚨' : risk.severity === 'high' ? '⚠️' : '💡'}</span>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{risk.message}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Medicine', icon: '💊', path: '/medicines', gradient: 'from-violet-500 to-purple-600' },
            { label: 'Record Vitals', icon: '📊', path: '/vitals', gradient: 'from-emerald-500 to-green-600' },
            { label: 'Appointment', icon: '📅', path: '/appointments', gradient: 'from-blue-500 to-indigo-600' },
            { label: 'Add Expense', icon: '💰', path: '/expenses', gradient: 'from-amber-500 to-orange-600' },
          ].map((action, i) => (
            <motion.button
              key={i}
              onClick={() => navigate(action.path)}
              variants={fadeUp}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className={`bg-gradient-to-br ${action.gradient} p-4 rounded-2xl text-white font-medium text-sm shadow-md`}>
              <motion.span
                className="text-3xl block mb-2"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}>
                {action.icon}
              </motion.span>
              {action.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Today's Medicines */}
      <motion.div
        variants={fadeUp}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <GiMedicines className="text-purple-500" />
            </div>
            Today's Medicines
          </h2>
          <button onClick={() => navigate('/medicines')}
            className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
            View All <FiArrowRight size={14} />
          </button>
        </div>

        {todayMeds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8">
            <motion.span
              className="text-4xl block mb-2"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}>
              💊
            </motion.span>
            <p className="text-gray-400 dark:text-gray-500 mb-4">No medicines scheduled</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/medicines')}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 text-sm font-medium">
              + Add Medicine
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {todayMeds.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => navigate('/medicines')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💊</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{item.medicine.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.medicine.dosage}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.times.map((t, j) => (
                    <motion.span
                      key={j}
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        t.status === 'given' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        t.status === 'missed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                      {formatTime(t.time)} {t.status === 'given' ? '✅' : t.status === 'missed' ? '❌' : '⏳'}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Latest Vitals */}
      {latestVital && (
        <motion.div
          variants={fadeUp}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FiActivity className="text-green-500" />
              </div>
              Latest Vitals
            </h2>
            <button onClick={() => navigate('/vitals')}
              className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
              View All <FiArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Blood Pressure', value: latestVital.bloodPressure ? `${latestVital.bloodPressure.systolic}/${latestVital.bloodPressure.diastolic}` : null, unit: 'mmHg', icon: '❤️', alert: latestVital.bloodPressure?.systolic > 140 },
              { label: 'Blood Sugar', value: latestVital.bloodSugar, unit: 'mg/dL', icon: '🩸', alert: latestVital.bloodSugar > 180 },
              { label: 'Oxygen', value: latestVital.oxygenLevel ? `${latestVital.oxygenLevel}%` : null, unit: '', icon: '💨', alert: latestVital.oxygenLevel < 92 },
              { label: 'Temperature', value: latestVital.temperature ? `${latestVital.temperature}°F` : null, unit: '', icon: '🌡️', alert: latestVital.temperature > 100.4 },
            ].filter(v => v.value).map((vital, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2, scale: 1.02 }}
                className={`rounded-2xl p-4 text-center cursor-pointer ${
                  vital.alert
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}
                onClick={() => navigate('/vitals')}>
                <motion.span
                  className="text-2xl block"
                  animate={{ scale: vital.alert ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 1, repeat: vital.alert ? Infinity : 0 }}>
                  {vital.icon}
                </motion.span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{vital.label}</p>
                <p className={`font-bold text-lg mt-1 ${vital.alert ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
                  {vital.value}
                </p>
                {vital.alert && (
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-xs text-red-500 mt-1">
                    ⚠️ High
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}