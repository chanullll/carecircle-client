import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, FiLayers, FiCalendar, FiClock, FiPlus,
  FiChevronRight, FiCheckCircle, FiAlertOctagon, FiDollarSign, FiHeart, FiXCircle, FiUsers
} from 'react-icons/fi';

// Helper: Safety parse for HH:mm
const parseTime = (timeStr) => {
  if (!timeStr) return new Date();
  const parts = timeStr.split(':');
  if (parts.length !== 2) return new Date();
  const d = new Date();
  d.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
  return d;
};

export default function Dashboard() {
  const { user, currentCircle } = useAuth() || {};
  const navigate = useNavigate();
  const [data, setData] = useState({ vitals: [], medicines: [], appointments: [], expenses: 0 });
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("---");
  const [nextMed, setNextMed] = useState(null);

  useEffect(() => {
    if (currentCircle?._id) {
        loadDashboardData();
    } else {
        setLoading(false);
    }
  }, [currentCircle]);

  const loadDashboardData = async () => {
    try {
      const [vRes, mRes, aRes, eRes] = await Promise.allSettled([
        API.get(`/vitals/circle/${currentCircle._id}`),
        API.get(`/medicines/circle/${currentCircle._id}`),
        API.get(`/appointments/circle/${currentCircle._id}`),
        API.get(`/expenses/circle/${currentCircle._id}`)
      ]);
      setData({
        vitals: vRes.status === 'fulfilled' ? vRes.value.data.data : [],
        medicines: mRes.status === 'fulfilled' ? mRes.value.data.data : [],
        appointments: aRes.status === 'fulfilled' ? aRes.value.data.data : [],
        expenses: eRes.status === 'fulfilled' ? eRes.value.data.data.reduce((sum, e) => sum + e.amount, 0) : 0
      });
    } catch (error) { 
        console.error("Fetch error:", error); 
    } finally { 
        setLoading(false); 
    }
  };

  // Timer & Reminder Logic
  useEffect(() => {
    if (!data.medicines || data.medicines.length === 0) {
        setTimeLeft("No medicines");
        return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      let upcoming = null;

      data.medicines.forEach(med => {
        if (med.times && Array.isArray(med.times)) {
            med.times.forEach(t => {
                const medTime = parseTime(t);
                if (medTime > now && (!upcoming || medTime < upcoming.time)) {
                    upcoming = { ...med, time: medTime, timeStr: t };
                }
            });
        }
      });

      if (upcoming) {
        setNextMed(upcoming);
        const diff = upcoming.time - now;
        
        // --- 15 MINUTE PROACTIVE ALERT LOGIC ---
        const minsLeft = Math.floor(diff / 60000);
        const toastId = `reminder-${upcoming._id}-${upcoming.timeStr}`;
        
        // Show toast exactly at 15 minutes left, if not already shown
        if (minsLeft === 15 && !toast.isActive(toastId)) {
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-indigo-500/20 p-4 border-l-4 border-indigo-500`}>
                    <div className="flex-1 w-0 p-1">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <FiClock className="h-10 w-10 text-indigo-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Medicine Reminder</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Time to prepare {upcoming.name} ({upcoming.dosage}). Scheduled in 15 minutes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { id: toastId, duration: 6000 });
        }
        // ---------------------------------------

        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      } else {
        setNextMed(null);
        setTimeLeft("All done for today");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data.medicines]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-400 font-bold tracking-widest animate-pulse uppercase">Circle Loading...</div>
    </div>
  );

  return (
    <div className="relative min-h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full filter blur-[100px] animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full filter blur-[100px] animate-pulse delay-700"></div>

      <div className="relative z-10 space-y-8 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Good Morning, {user?.name?.split(' ')[0] || 'Caregiver'}</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <div className="flex gap-2 mt-4">
              <span className="px-3 py-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-white/20 flex items-center gap-1.5 uppercase tracking-wider">
                <FiUsers size={12} /> {currentCircle?.name || 'Family Circle'}
              </span>
              <span className="px-3 py-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-white/20 flex items-center gap-1.5 uppercase tracking-wider">
                <FiActivity size={12} /> {currentCircle?.patient?.name || 'Patient'}
              </span>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/emergency')}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-rose-600/30 uppercase tracking-tighter"
          >
            <FiAlertOctagon size={20} className="animate-pulse" /> Emergency SOS
          </motion.button>
        </header>

        {/* 1. UP NEXT BANNER */}
        <section className="bg-slate-900 dark:bg-slate-800/60 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 border border-white/5">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/10">
                <FiClock size={32} className="text-indigo-400" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Upcoming Medicine</p>
                <h2 className="text-3xl font-black tracking-tight mt-1 uppercase">{nextMed ? nextMed.name : "All Meds Taken"}</h2>
                <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">{nextMed ? `${nextMed.dosage} • Scheduled for ${nextMed.timeStr}` : "No more doses scheduled for today"}</p>
             </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 text-center min-w-[200px]">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Time Remaining</p>
             <p className="text-3xl font-black tracking-tighter text-indigo-400">{timeLeft}</p>
          </div>
        </section>

        {/* 2. STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Today Given', val: '1', icon: <FiCheckCircle />, col: 'text-emerald-500', bg: 'bg-emerald-500/10', tag: 'GIVEN' },
            { label: 'Pending', val: data.medicines.length, icon: <FiClock />, col: 'text-amber-500', bg: 'bg-amber-500/10', tag: 'PENDING' },
            { label: 'Missed', val: '0', icon: <FiXCircle />, col: 'text-rose-500', bg: 'bg-rose-500/10', tag: 'MISSED' },
            { label: 'Health Score', val: '75', icon: <FiHeart />, col: 'text-indigo-500', bg: 'bg-indigo-500/10', tag: 'SCORE', sub: 'Grade: B - Good' },
          ].map((stat, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-6 bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl relative"
            >
              <span className="absolute top-6 right-6 text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.tag}</span>
              <div className={`p-3 w-fit rounded-2xl mb-6 ${stat.bg} ${stat.col}`}>{stat.icon}</div>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.val}</p>
              {stat.sub && <p className="text-[10px] font-bold text-amber-500 mt-1 uppercase tracking-wider">{stat.sub}</p>}
            </motion.div>
          ))}
        </div>

        {/* 3. QUICK ACTIONS & TODAY'S SCHEDULE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <section className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/20 shadow-xl">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase tracking-widest flex items-center gap-2 mb-8">
                    <FiActivity size={18} className="text-indigo-500" /> Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Add Medicine', icon: <FiPlus />, col: 'bg-indigo-500', path: '/medicines' },
                        { label: 'Record Vitals', icon: <FiActivity />, col: 'bg-emerald-500', path: '/vitals' },
                        { label: 'Appointment', icon: <FiCalendar />, col: 'bg-purple-500', path: '/appointments' },
                        { label: 'Add Expense', icon: <FiDollarSign />, col: 'bg-orange-500', path: '/expenses' },
                    ].map((act, i) => (
                        <button key={i} onClick={() => navigate(act.path)} className={`${act.col} p-6 rounded-[2rem] text-white flex flex-col items-start gap-4 hover:scale-[1.02] transition-all shadow-lg active:scale-95`}>
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">{act.icon}</div>
                            <span className="font-bold text-sm tracking-tight uppercase">{act.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Today's Schedule */}
            <section className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase tracking-widest flex items-center gap-2">
                        <FiClock size={18} className="text-indigo-500" /> Today's Schedule
                    </h3>
                    <button onClick={() => navigate('/schedule')} className="text-xs font-bold text-indigo-500 uppercase tracking-widest hover:gap-2 transition-all flex items-center gap-1">View All <FiChevronRight /></button>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {data.medicines.length > 0 ? (
                        data.medicines.map((med, i) => (
                            <div key={i} className="p-4 bg-white/40 dark:bg-slate-700/30 rounded-2xl border border-white/10 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        <FiActivity size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-tight">{med.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{med.dosage}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {med.times && med.times.map((t, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-100 dark:border-slate-700 flex items-center gap-1">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-400 text-sm uppercase tracking-widest">No medicines recorded.</div>
                    )}
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}