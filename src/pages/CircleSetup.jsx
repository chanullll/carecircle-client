import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiUser, FiCalendar, FiDroplet, FiArrowRight, FiActivity } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CircleSetup() {
  const [formData, setFormData] = useState({ name: '', patientName: '', age: '', bloodType: '', conditions: '' });
  const [loading, setLoading] = useState(false);
  const { selectCircle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post('/circles', {
        name: formData.name,
        patient: { name: formData.patientName, age: formData.age, bloodType: formData.bloodType, conditions: formData.conditions.split(',') }
      });
      selectCircle(response.data.data);
      toast.success('Circle Created Successfully!');
      navigate('/');
    } catch (error) { toast.error('Failed to create circle'); } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 w-full max-w-[500px]">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
            <FiActivity className="text-indigo-500" /> Circle Setup
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Family/Circle Name</label>
              <input type="text" required placeholder="e.g. Silva Family" onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient Full Name</label>
              <input type="text" required placeholder="Full Name" onChange={e => setFormData({...formData, patientName: e.target.value})}
                className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                <input type="number" required placeholder="65" onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Type</label>
                <input type="text" placeholder="O+" onChange={e => setFormData({...formData, bloodType: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all" />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl transition-all">
              {loading ? "Creating..." : <>Complete Setup <FiArrowRight /></>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}