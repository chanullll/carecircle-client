import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, FiPlus, FiChevronRight, FiHeart, FiThermometer, 
  FiWind, FiInfo, FiX, FiDroplet, FiTrendingUp 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Vitals() {
  const { currentCircle } = useAuth();
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('BP'); // BP, Sugar, Temp, Oxygen
  const [formData, setFormData] = useState({
    systolic: '', diastolic: '', bloodSugar: '', temperature: '',
    heartRate: '', weight: '', oxygenLevel: '', notes: ''
  });

  useEffect(() => {
    if (currentCircle?._id) fetchVitals();
  }, [currentCircle]);

  const fetchVitals = async () => {
    try {
      const { data } = await API.get(`/vitals/circle/${currentCircle._id}`);
      setVitals(data.data || []);
    } catch (err) { toast.error("Failed to fetch vitals"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/vitals', { ...formData, circleId: currentCircle._id });
      toast.success('Vitals recorded successfully');
      setShowModal(false);
      setFormData({ systolic: '', diastolic: '', bloodSugar: '', temperature: '', heartRate: '', weight: '', oxygenLevel: '', notes: '' });
      fetchVitals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record vitals');
    }
  };

  // 📊 Chart Data Preparation Logic
  const chartData = useMemo(() => {
    return [...vitals].reverse().map(v => ({
      date: new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      systolic: v.bloodPressure?.systolic || 0,
      diastolic: v.bloodPressure?.diastolic || 0,
      sugar: v.bloodSugar || 0,
      temp: v.temperature || 0,
      oxygen: v.oxygenLevel || 0
    }));
  }, [vitals]);

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold animate-pulse uppercase tracking-widest">Syncing Health Intelligence...</div>;

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-400/10 dark:bg-rose-600/10 rounded-full filter blur-[100px] animate-pulse" />
      
      <div className="relative z-10 space-y-8 max-w-6xl mx-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Vital Analytics</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Health Trend Monitoring</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-rose-600/30 uppercase tracking-tighter"
          >
            <FiPlus /> New Record
          </motion.button>
        </header>

        {/* 📈 Premium Chart Section */}
        <section className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20"><FiTrendingUp size={24} /></div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Performance Trends</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Real-time health visualization</p>
               </div>
            </div>

            {/* Apple-style Sliding Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl">
              {[
                { id: 'BP', label: 'Blood Pressure', icon: <FiHeart /> },
                { id: 'Sugar', label: 'Sugar', icon: <FiDroplet /> },
                { id: 'Temp', label: 'Temp', icon: <FiThermometer /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                />
                {activeTab === 'BP' ? (
                  <>
                    <Area type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                    <Area type="monotone" dataKey="diastolic" stroke="#6366f1" strokeWidth={4} fillOpacity={0} />
                  </>
                ) : activeTab === 'Sugar' ? (
                  <Area type="monotone" dataKey="sugar" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                ) : (
                  <Area type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Vitals Grid Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vitals.length > 0 ? vitals.slice(0, 6).map((v, i) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="p-6 bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-xl relative group hover:scale-[1.02] transition-all">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{new Date(v.createdAt).toLocaleDateString()}</span>
                        {v.abnormalAlert && <div className="flex items-center gap-1 bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full text-[8px] font-black animate-pulse"><FiInfo size={10}/> ALERT</div>}
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{v.bloodPressure?.systolic}/{v.bloodPressure?.diastolic}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Pressure</p>
                            </div>
                            <div className="text-right text-emerald-500"><FiHeart size={24} /></div>
                        </div>
                        <div className="h-[1px] bg-slate-100 dark:bg-slate-700/50 w-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">{v.bloodSugar || '--'} <span className="text-[8px] text-slate-400">mg/dL</span></p>
                                <p className="text-[8px] font-black text-slate-500 uppercase">Sugar</p>
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">{v.oxygenLevel || '--'}<span className="text-[8px] text-slate-400">%</span></p>
                                <p className="text-[8px] font-black text-slate-500 uppercase">Oxygen</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )) : <div className="col-span-3 text-center py-20 text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">No diagnostic records found.</div>}
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/20 shadow-2xl w-full max-w-lg"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Record New Vitals</h2>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 rounded-full transition-all"><FiX size={20}/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Systolic</label>
                        <input type="number" placeholder="120" onChange={e => setFormData({...formData, systolic: e.target.value})} className="w-full p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all font-bold" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diastolic</label>
                        <input type="number" placeholder="80" onChange={e => setFormData({...formData, diastolic: e.target.value})} className="w-full p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all font-bold" required />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sugar (mg/dL)</label>
                        <input type="number" placeholder="100" onChange={e => setFormData({...formData, bloodSugar: e.target.value})} className="w-full p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Oxygen (%)</label>
                        <input type="number" placeholder="98" onChange={e => setFormData({...formData, oxygenLevel: e.target.value})} className="w-full p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all font-bold" />
                    </div>
                </div>
                
                <button type="submit" className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
                    Save Diagnostic Data
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}