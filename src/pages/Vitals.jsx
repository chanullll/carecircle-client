import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiPlus, FiChevronRight, FiHeart, FiThermometer, FiWind, FiInfo, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function Vitals() {
  const { currentCircle } = useAuth();
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
      // 🛡️ CRITICAL: Send circleId with vital data
      await API.post('/vitals', { ...formData, circleId: currentCircle._id });
      toast.success('Vitals recorded successfully');
      setShowModal(false);
      setFormData({ systolic: '', diastolic: '', bloodSugar: '', temperature: '', heartRate: '', weight: '', oxygenLevel: '', notes: '' });
      fetchVitals();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to record vitals');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold animate-pulse uppercase">Syncing Vitals...</div>;

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-400/10 rounded-full blur-[100px] animate-pulse" />
      
      <div className="relative z-10 space-y-8 max-w-5xl mx-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Health Vitals</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Vital Sign Monitoring</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-rose-600/30 uppercase tracking-tighter"
          >
            <FiPlus /> Record New
          </motion.button>
        </header>

        {/* Vitals Grid Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vitals.length > 0 ? vitals.slice(0, 3).map((v, i) => (
                <div key={i} className="p-6 bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(v.createdAt).toLocaleDateString()}</span>
                        {v.abnormalAlert && <span className="bg-rose-500 w-2 h-2 rounded-full animate-ping" />}
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {v.bloodPressure?.systolic}/{v.bloodPressure?.diastolic} <span className="text-xs text-slate-400 font-bold uppercase ml-1">mmHg</span>
                    </p>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Blood Pressure</p>
                </div>
            )) : <div className="col-span-3 text-center py-12 text-slate-400 font-bold">No vital records found.</div>}
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/20 shadow-2xl w-full max-w-lg"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Record Vitals</h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><FiX /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Systolic (120)" onChange={e => setFormData({...formData, systolic: e.target.value})} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white" required />
                    <input type="number" placeholder="Diastolic (80)" onChange={e => setFormData({...formData, diastolic: e.target.value})} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white" required />
                </div>
                <input type="number" placeholder="Blood Sugar (mg/dL)" onChange={e => setFormData({...formData, bloodSugar: e.target.value})} className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white" />
                <input type="number" step="0.1" placeholder="Temperature (°F)" onChange={e => setFormData({...formData, temperature: e.target.value})} className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white" />
                <input type="number" placeholder="Oxygen Level (%)" onChange={e => setFormData({...formData, oxygenLevel: e.target.value})} className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white" />
                
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20">
                    Save Record
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}