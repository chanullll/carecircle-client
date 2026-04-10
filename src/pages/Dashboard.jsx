import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, FiLayers, FiCalendar, FiClock, FiPlus,
  FiChevronRight, FiCheckCircle, FiAlertOctagon, FiDollarSign, FiHeart, FiXCircle, FiUsers, FiCheck
} from 'react-icons/fi';

const parseTime = (timeStr) => {
  if (!timeStr) return new Date();
  const parts = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
  return d;
};

export default function Dashboard() {
  const { user, currentCircle } = useAuth() || {};
  const navigate = useNavigate();
  const [data, setData] = useState({ 
    vitals: [], 
    medicines: [], 
    appointments: [], 
    expenses: 0,
    stats: { given: 0, pending: 0, missed: 0 } 
  });
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("---");
  const [nextMed, setNextMed] = useState(null);

  useEffect(() => {
    if (currentCircle?._id) loadDashboardData();
  }, [currentCircle]);

  const loadDashboardData = async () => {
    try {
      // 1. Fetching all core data including the new 'Today Status' from Backend
      const [vRes, mTodayRes, aRes, eRes] = await Promise.allSettled([
        API.get(`/vitals/circle/${currentCircle._id}`),
        API.get(`/medicines/today/${currentCircle._id}`), // New Endpoint we added to backend
        API.get(`/appointments/circle/${currentCircle._id}`),
        API.get(`/expenses/circle/${currentCircle._id}`)
      ]);

      const medicineTodayData = mTodayRes.status === 'fulfilled' ? mTodayRes.value.data : { stats: { given: 0, pending: 0, missed: 0 }, data: [] };

      setData({
        vitals: vRes.status === 'fulfilled' ? vRes.value.data.data : [],
        medicines: medicineTodayData.data, // This now contains status per time slot
        appointments: aRes.status === 'fulfilled' ? aRes.value.data.data : [],
        expenses: eRes.status === 'fulfilled' ? eRes.value.data.data.reduce((sum, e) => sum + e.amount, 0) : 0,
        stats: medicineTodayData.stats
      });
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleMarkAsTaken = async (medicineId, scheduledTime) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await API.post('/medicines/mark-given', {
        medicineId,
        scheduledTime,
        date: today,
        circleId: currentCircle._id
      });
      toast.success('Medicine marked as taken');
      loadDashboardData(); // Refresh stats and list
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Timer Logic
  useEffect(() => {
    if (!data.medicines || data.medicines.length === 0) return;
    const timer = setInterval(() => {
      const now = new Date();
      let upcoming = null;
      data.medicines.forEach(item => {
        item.times.forEach(tSlot => {
          const medTime = parseTime(tSlot.time);
          if (medTime > now && tSlot.status === 'pending' && (!upcoming || medTime < upcoming.time)) {
            upcoming = { ...item.medicine, time: medTime, timeStr: tSlot.time };
          }
        });
      });
      if (upcoming) {
        const diff = upcoming.time - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setNextMed(upcoming);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      } else { setTimeLeft("No pending doses"); setNextMed(null); }
    }, 1000);
    return () => clearInterval(timer);
  }, [data.medicines]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400 font-bold tracking-widest animate-pulse uppercase">Syncing Circle...</div>;

  return (
    <div className="relative min-h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-400/10 rounded-full filter blur-[100px] animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-400/10 rounded-full filter blur-[100px] animate-pulse delay-700"></div>

      <div className="relative z-10 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Good Morning, {user?.name?.split(' ')[0]}</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/emergency')} className="flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-rose-600/30 uppercase tracking-tighter">
            <FiAlertOctagon size={20} className="animate-pulse" /> Emergency SOS
          </motion.button>
        </header>

        {/* 1. UP NEXT BANNER */}
        <section className="bg-slate-900 dark:bg-slate-800/80 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 border border-white/5">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/10">
                <FiClock size={32} className="text-indigo-400" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Upcoming Dose</p>
                <h2 className="text-3xl font-black tracking-tight mt-1 uppercase">{nextMed ? nextMed.name : "All Meds Taken"}</h2>
                <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">{nextMed ? `${nextMed.dosage} • Scheduled for ${nextMed.timeStr}` : "No more pending doses for today"}</p>
             </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 text-center min-w-[200px]">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Time Remaining</p>
             <p className="text-3xl font-black tracking-tighter text-indigo-400">{timeLeft}</p>
          </div>
        </section>

        {/* 2. STATS GRID - Now Dynamic! */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Today Given', val: data.stats.given, icon: <FiCheckCircle />, col: 'text-emerald-500', bg: 'bg-emerald-500/10', tag: 'GIVEN' },
            { label: 'Pending', val: data.stats.pending, icon: <FiClock />, col: 'text-amber-500', bg: 'bg-amber-500/10', tag: 'PENDING' },
            { label: 'Missed', val: data.stats.missed, icon: <FiXCircle />, col: 'text-rose-500', bg: 'bg-rose-500/10', tag: 'MISSED' },
            { label: 'Health Score', val: '75', icon: <FiHeart />, col: 'text-indigo-500', bg: 'bg-indigo-500/10', tag: 'SCORE', sub: 'Grade: B - Good' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-6 bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl relative">
              <span className="absolute top-6 right-6 text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.tag}</span>
              <div className={`p-3 w-fit rounded-2xl mb-6 ${stat.bg} ${stat.col}`}>{stat.icon}</div>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.val}</p>
              {stat.sub && <p className="text-[10px] font-bold text-amber-500 mt-1 uppercase tracking-wider">{stat.sub}</p>}
            </motion.div>
          ))}
        </div>

        {/* 3. TODAY'S SCHEDULE WITH ACTION BUTTONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions (Keep same) */}
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

            {/* Today's Schedule - Enhanced! */}
            <section className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase tracking-widest flex items-center gap-2">
                        <FiClock size={18} className="text-indigo-500" /> Today's Schedule
                    </h3>
                    <button onClick={() => navigate('/schedule')} className="text-xs font-bold text-indigo-500 uppercase tracking-widest hover:gap-2 transition-all flex items-center gap-1">View All <FiChevronRight /></button>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {data.medicines.map((item, i) => (
                        <div key={i} className="p-4 bg-white/40 dark:bg-slate-700/30 rounded-2xl border border-white/10 space-y-3 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                                        <FiActivity size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-tight">{item.medicine.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.medicine.dosage}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {item.times.map((tSlot, idx) => (
                                    <button 
                                        key={idx}
                                        disabled={tSlot.status === 'given'}
                                        onClick={() => handleMarkAsTaken(item.medicine._id, tSlot.time)}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 transition-all ${
                                            tSlot.status === 'given' 
                                            ? 'bg-emerald-500 text-white cursor-default' 
                                            : tSlot.status === 'missed'
                                            ? 'bg-rose-500 text-white shadow-lg'
                                            : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700 hover:border-indigo-500'
                                        }`}
                                    >
                                        {tSlot.status === 'given' ? <FiCheck /> : <FiClock size={10} />}
                                        {tSlot.time}
                                        {tSlot.status === 'pending' && <span className="ml-1 opacity-50">• Mark Taken</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}