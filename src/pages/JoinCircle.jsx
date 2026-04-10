import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { joinCircle } from '../services/circleService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiUsers, FiKey, FiUserCheck, FiArrowRight, FiInfo, FiPlus } from 'react-icons/fi';

export default function JoinCircle() {
  const [inviteCode, setInviteCode] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectCircle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await joinCircle(inviteCode, relationship);
      selectCircle(data.data);
      toast.success('Successfully joined the family circle!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join. Check the code!');
    } finally {
      setLoading(false);
    }
  };

  // Smooth animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative w-full py-8">
      
      {/* Localized Glowing Orbs for the Dashboard Area */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[80px]"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-[100px]"
        />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[460px] px-4"
      >
        
        {/* Header Section */}
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-5 relative"
          >
            <FiUsers className="text-white text-3xl relative z-10" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Join Family Circle
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Connect with your family's care network
          </p>
        </motion.div>

        {/* Premium Glass Card */}
        <motion.div 
          variants={fadeInUp}
          className="backdrop-blur-2xl bg-white/70 dark:bg-slate-800/70 rounded-[2rem] shadow-xl border border-white/50 dark:border-slate-700/50 p-6 sm:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Invite Code Input (Pin-code style) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                Invite Code
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <FiKey size={20} />
                </div>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full pl-12 pr-4 py-4 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white placeholder-slate-300 text-center text-2xl font-mono tracking-[0.25em] font-bold"
                  placeholder="XXXXXX"
                  maxLength={6}
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-1 text-center">
                Enter the 6-digit code provided by the circle admin
              </p>
            </div>

            {/* Relationship Select */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                Your Role / Relationship
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
                  <FiUserCheck size={18} />
                </div>
                <select
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white text-sm font-medium appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="text-slate-400">Select your relationship</option>
                  <option value="son">Son</option>
                  <option value="daughter">Daughter</option>
                  <option value="spouse">Spouse</option>
                  <option value="sibling">Sibling</option>
                  <option value="parent">Parent</option>
                  <option value="caregiver">Professional Caregiver</option>
                  <option value="other">Other</option>
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    Join Securely
                    <motion.div className="group-hover:translate-x-1 transition-transform duration-300">
                      <FiArrowRight size={18} />
                    </motion.div>
                  </>
                )}
              </div>
            </motion.button>
          </form>

        </motion.div>

        {/* Setup New Circle Link */}
        <motion.div 
          variants={fadeInUp}
          className="mt-6 bg-blue-50/50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700 rounded-2xl p-5 flex items-center justify-between backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
              <FiInfo className="text-blue-500" size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Don't have a code?</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Start a new circle</p>
            </div>
          </div>
          <Link to="/setup">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 flex items-center gap-1"
            >
              <FiPlus /> Create
            </motion.button>
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
}