import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiActivity } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      
      // ✅ SUCCESS! We found the structure from your response:
      // Structure is: response.data.data (which contains user info AND token)
      const res = response.data;

      if (res.success && res.data) {
        const userData = res.data;
        const token = res.data.token;

        if (token) {
          login(userData, token);
          toast.success(`Welcome back, ${userData.name}!`);
          navigate('/');
        } else {
          toast.error('Auth token missing in response.');
        }
      } else {
        toast.error(res.message || 'Login failed.');
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 overflow-hidden">
      {/* Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl mb-4"><FiActivity size={30} className="text-white" /></div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">CareCircle</h1>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
          <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white tracking-tight uppercase">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com"
                className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                  className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500">
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">
              {loading ? 'Processing...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
              Don't have an account? <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline">Create Account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}