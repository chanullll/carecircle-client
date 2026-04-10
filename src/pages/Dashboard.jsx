import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTodayStatus } from '../services/medicineService';
import { getLatestVital, getHealthScore } from '../services/vitalService';
import { formatTime } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, FiAlertCircle, FiPlus, FiClock, FiArrowRight, 
  FiCheckCircle, FiXCircle, FiHome, FiUser, FiCalendar, 
  FiDollarSign, FiHeart, FiDroplet, FiWind, FiThermometer, FiAlertTriangle
} from 'react-icons/fi';

export default function Dashboard() {
  const { user, currentCircle } = useAuth();
  const navigate = useNavigate();
  const [todayMeds, setTodayMeds] = useState([]);
  const [latestVital, setLatestVital] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [stats, setStats] = useState({ given: 0, pending: 0, missed: 0 });
  const [loading, setLoading] = useState(true);
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
      // PRO TIP: Fetch all data concurrently (සමගාමීව) to reduce load time by 3x!
      const [medsRes, vitalRes, scoreRes] = await Promise.allSettled([
        getTodayStatus(currentCircle._id),
        getLatestVital(currentCircle._id),
        getHealthScore(currentCircle._id)
      ]);

      // Handle Medicines
      if (medsRes.status === 'fulfilled' && medsRes.value.data) {
        const medsList = medsRes.value.data;
        setTodayMeds(medsList);

        let given = 0, pending = 0, missed = 0;
        const pendingMeds = [];
        medsList.forEach(med => {
          med.times.forEach(t => {
            if (t.status === 'given') given++;
            else if (t.status === 'missed') missed++;
            else {
              pending++;
              pendingMeds.push({ name: med.medicine.name, time: t.time, dosage: med.medicine.dosage });
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
      }

      // Handle Vitals
      if (vitalRes.status === 'fulfilled' && vitalRes.value.data) {
        setLatestVital(vitalRes.value.data);
      }

      // Handle Health Score
      if (scoreRes.status === 'fulfilled' && scoreRes.value.data) {
        setHealthScore(scoreRes.value.data);
      }

    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ultra-Smooth Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };
  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  if (!currentCircle) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 mb-6 shadow-inner">
            <FiUsers className="text-4xl text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No Family Circle</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
            You are not part of any family circle yet. Create a new one or join an existing circle to get started.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/setup')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2">
              <FiPlus /> Create Circle
            </button>
            <button onClick={() => navigate('/join-circle')} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 transition-colors">
              Join Existing
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      {/* Premium Loading State (Heartbeat Pulse) */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4"
      >
        <FiHeart className="text-white text-2xl" />
      </motion.div>
      <motion.p 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-widest uppercase"
      >
        Syncing Health Data...
      </motion.p>
    </div>
  );

  const greeting = new Date().getHours() < 12 ? 'Good Morning' :
    new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.3 }}
      className="relative max-w-7xl mx-auto space-y-6 lg:space-y-8"
    >
      
      {/* Header Section */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {greeting}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
            {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <motion.span
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/settings')}
              className="inline-flex items-center gap-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors hover:bg-white dark:hover:bg-slate-700 shadow-sm"
            >
              <FiHome className="text-blue-500" /> {currentCircle.name}
            </motion.span>
            <span className="inline-flex items-center gap-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
              <FiUser className="text-emerald-500" /> {currentCircle.patient?.name}
            </span>
          </div>
        </div>

        {/* SOS Button */}
        <motion.button
          onClick={() => navigate('/emergency')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="relative group overflow-hidden bg-red-500 text-white px-6 py-3.5 rounded-2xl font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-red-400 rounded-2xl z-0"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
          <FiAlertTriangle className="relative z-10" size={20} />
          <span className="relative z-10 uppercase tracking-widest text-sm">Emergency SOS</span>
        </motion.button>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">

        {/* Premium Next Medicine Banner */}
        <AnimatePresence>
          {nextMedicine && (
            <motion.div
              variants={fadeInUp}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative overflow-hidden bg-slate-900 dark:bg-slate-800 rounded-[2rem] p-6 lg:p-8 text-white shadow-xl border border-slate-800 dark:border-slate-700"
            >
              <div className="absolute inset-0 opacity-40">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-[80px]" />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                    <FiClock className="text-blue-300 text-xl" />
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Up Next</p>
                    <h3 className="text-2xl lg:text-3xl font-bold tracking-tight mb-1">{nextMedicine.name}</h3>
                    <p className="text-slate-300 text-sm font-medium">{nextMedicine.dosage} • Scheduled for {formatTime(nextMedicine.time)}</p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[140px] text-center shrink-0 w-full md:w-auto">
                  <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider mb-1">Time Remaining</p>
                  <motion.p
                    key={countdown}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-mono font-bold tracking-tight"
                  >
                    {countdown || '--h --m'}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Given Today', value: stats.given, icon: FiCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Pending', value: stats.pending, icon: FiClock, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'Missed', value: stats.missed, icon: FiXCircle, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
            healthScore ? {
              label: 'Health Score', value: healthScore.healthScore, sub: healthScore.grade, icon: FiHeart,
              color: healthScore.healthScore >= 80 ? 'text-blue-500' : 'text-amber-500',
              bg: healthScore.healthScore >= 80 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-amber-500/10 border-amber-500/20'
            } : null
          ].filter(Boolean).map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              className="backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 rounded-2xl p-5 border border-white/50 dark:border-slate-700/50 shadow-sm relative overflow-hidden group cursor-default"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${stat.bg} dark:opacity-0`} />
              <div className="relative z-10 flex justify-between items-start mb-4">
                <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={stat.color} size={16} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                  {stat.label}
                </span>
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{stat.value}</p>
                {stat.sub && <p className={`text-xs font-semibold mt-1 ${stat.color}`}>Grade: {stat.sub}</p>}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="space-y-6">
            <motion.div variants={fadeInUp} className="backdrop-blur-2xl bg-white/50 dark:bg-slate-800/50 rounded-3xl p-6 border border-white/50 dark:border-slate-700/50 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <FiActivity className="text-blue-500" /> Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Add Medicine', icon: FiPlus, path: '/medicines', color: 'from-blue-500 to-indigo-500' },
                  { label: 'Record Vitals', icon: FiActivity, path: '/vitals', color: 'from-emerald-400 to-teal-500' },
                  { label: 'Appointment', icon: FiCalendar, path: '/appointments', color: 'from-purple-500 to-pink-500' },
                  { label: 'Add Expense', icon: FiDollarSign, path: '/expenses', color: 'from-amber-400 to-orange-500' },
                ].map((action, i) => (
                  <motion.button
                    key={i}
                    onClick={() => navigate(action.path)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative overflow-hidden p-4 rounded-2xl text-white font-medium text-sm shadow-md text-left group`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative z-10">
                      <action.icon size={20} className="mb-2 opacity-80" />
                      <span className="font-bold tracking-wide">{action.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <AnimatePresence>
              {healthScore?.risks?.length > 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="backdrop-blur-2xl bg-white/60 dark:bg-slate-800/60 rounded-3xl border border-white/50 dark:border-slate-700/50 p-6 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                        <FiAlertCircle className="text-red-500 text-xs" />
                      </div>
                      Health Alerts
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {healthScore.risks.map((risk, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border ${
                          risk.severity === 'critical' ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' :
                          risk.severity === 'high' ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20' :
                          'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20'
                        }`}
                      >
                        <FiAlertCircle className={`mt-0.5 shrink-0 ${
                          risk.severity === 'critical' ? 'text-red-500' :
                          risk.severity === 'high' ? 'text-orange-500' : 'text-amber-500'
                        }`} />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">{risk.message}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <motion.div
              variants={fadeInUp}
              className="backdrop-blur-2xl bg-white/60 dark:bg-slate-800/60 rounded-3xl border border-white/50 dark:border-slate-700/50 p-6 shadow-sm h-full"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <FiClock className="text-blue-500" /> Today's Schedule
                </h2>
                <button onClick={() => navigate('/medicines')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors">
                  View All <FiArrowRight />
                </button>
              </div>

              {todayMeds.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiCheckCircle className="text-slate-400 text-xl" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No medicines scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayMeds.map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.01 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                          <FiActivity className="text-blue-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{item.medicine.name}</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.medicine.dosage}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.times.map((t, j) => (
                          <span
                            key={j}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                              t.status === 'given' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:emerald-500/20' :
                              t.status === 'missed' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' :
                              'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                            }`}
                          >
                            <FiClock size={10} /> {formatTime(t.time)}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Latest Vitals */}
        {latestVital && (
          <motion.div
            variants={fadeInUp}
            className="backdrop-blur-2xl bg-white/60 dark:bg-slate-800/60 rounded-3xl border border-white/50 dark:border-slate-700/50 p-6 shadow-sm"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FiActivity className="text-blue-500" /> Latest Vitals
              </h2>
              <button onClick={() => navigate('/vitals')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors">
                History <FiArrowRight />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Blood Pressure', value: latestVital.bloodPressure ? `${latestVital.bloodPressure.systolic}/${latestVital.bloodPressure.diastolic}` : null, unit: 'mmHg', icon: FiHeart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', alert: latestVital.bloodPressure?.systolic > 140 },
                { label: 'Blood Sugar', value: latestVital.bloodSugar, unit: 'mg/dL', icon: FiDroplet, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', alert: latestVital.bloodSugar > 180 },
                { label: 'Oxygen', value: latestVital.oxygenLevel ? `${latestVital.oxygenLevel}%` : null, unit: '', icon: FiWind, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10', alert: latestVital.oxygenLevel < 92 },
                { label: 'Temperature', value: latestVital.temperature ? `${latestVital.temperature}°F` : null, unit: '', icon: FiThermometer, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', alert: latestVital.temperature > 100.4 },
              ].filter(v => v.value).map((vital, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center border ${
                    vital.alert
                      ? 'bg-red-50/50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full ${vital.bg} flex items-center justify-center mb-2`}>
                    <vital.icon className={vital.color} size={18} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{vital.label}</p>
                  <div className="flex items-baseline gap-1">
                    <p className={`font-extrabold text-xl ${vital.alert ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                      {vital.value}
                    </p>
                    <span className="text-[10px] font-medium text-slate-400">{vital.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}