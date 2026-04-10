import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiArrowRight, FiShield, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function JoinCircle() {
  const [inviteCode, setJoinCode] = useState('');
  const [relationship, setRelationship] = useState('caregiver');
  const [loading, setLoading] = useState(false);
  const { selectCircle } = useAuth();
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post('/circles/join', { inviteCode, relationship });
      const circleData = response.data.data;
      selectCircle(circleData);
      toast.success('Successfully joined the Family Circle!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid Invite Code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden p-4">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-[500px]">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/20 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl mb-6 text-white">
              <FiUsers size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Connect to Circle</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 uppercase font-bold tracking-widest">Enter the unique invite code</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-8">
            <div className="space-y-2 text-center">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Invite Code</label>
              <input 
                type="text" 
                value={inviteCode} 
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="ABC123"
                // CRITICAL: Input Text Color Fix
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-3xl border-none outline-none focus:ring-2 focus:ring-indigo-500 py-5 text-center text-4xl font-black tracking-[0.5em] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Your Relationship</label>
              <select 
                value={relationship} 
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full pl-6 pr-4 py-4 bg-slate-100/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all appearance-none"
              >
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="spouse">Spouse</option>
                <option value="caregiver">Professional Caregiver</option>
                <option value="other">Other Member</option>
              </select>
            </div>

            <button disabled={loading} type="submit" className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all">
              {loading ? "Verifying..." : <><FiShield /> Enter the Circle <FiArrowRight /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-4">No code? Create your own circle</p>
            <button onClick={() => navigate('/setup')} className="flex items-center justify-center gap-2 mx-auto text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-[10px] hover:underline">
              <FiPlus /> New Circle Setup
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}