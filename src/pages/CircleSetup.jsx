import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createCircle } from '../services/circleService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiUser, FiCalendar, FiActivity, FiDroplet, FiHeart, FiArrowRight 
} from 'react-icons/fi';

export default function CircleSetup() {
  const { selectCircle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    patientName: '',
    patientAge: '',
    patientGender: 'male',
    conditions: '',
    bloodType: 'O+'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createCircle({
        name: form.name,
        patient: {
          name: form.patientName,
          age: Number(form.patientAge),
          gender: form.patientGender,
          conditions: form.conditions.split(',').map(c => c.trim()).filter(Boolean),
          bloodType: form.bloodType
        }
      });
      
      const circleData = response.data?.data || response.data || response;
      
      selectCircle(circleData);
      toast.success(`Circle created! Invite Code: ${circleData.inviteCode}`, {
        duration: 5000,
        icon: '🎉',
      });
      navigate('/');
    } catch (error) {
      console.error('Circle creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create circle');
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
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center relative w-full py-8">
      
      {/* Localized Glowing Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[90px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[20%] w-[450px] h-[450px] rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-[100px]"
        />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[540px] px-4"
      >
        
        {/* Header Section */}
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: -5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4 relative"
          >
            <FiHeart className="text-white text-3xl relative z-10" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Create Family Circle
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Setup a secure care group for your loved one
          </p>
        </motion.div>

        {/* Premium Glass Card */}
        <motion.div 
          variants={fadeInUp}
          className="backdrop-blur-2xl bg-white/70 dark:bg-slate-800/70 rounded-[2rem] shadow-xl border border-white/50 dark:border-slate-700/50 p-6 sm:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Circle Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                Circle Name
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <FiUsers size={18} />
                </div>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 text-sm font-medium"
                  placeholder="e.g. Silva Family Care"
                  required
                />
              </div>
            </div>

            {/* Patient Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                Patient Name
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <FiUser size={18} />
                </div>
                <input
                  type="text"
                  value={form.patientName}
                  onChange={e => setForm({...form, patientName: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 text-sm font-medium"
                  placeholder="e.g. Anura Silva"
                  required
                />
              </div>
            </div>

            {/* 3-Column Grid for Age, Gender, Blood Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Age */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                  Age
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <FiCalendar size={16} />
                  </div>
                  <input
                    type="number"
                    value={form.patientAge}
                    onChange={e => setForm({...form, patientAge: e.target.value})}
                    className="w-full pl-9 pr-3 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 text-sm font-medium"
                    placeholder="e.g. 70"
                    min="0"
                    max="150"
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                  Gender
                </label>
                <div className="relative group">
                  <select
                    value={form.patientGender}
                    onChange={e => setForm({...form, patientGender: e.target.value})}
                    className="w-full px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white text-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
              </div>

              {/* Blood Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                  Blood Type
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400/70 group-focus-within:text-red-500 transition-colors z-10">
                    <FiDroplet size={16} />
                  </div>
                  <select
                    value={form.bloodType}
                    onChange={e => setForm({...form, bloodType: e.target.value})}
                    className="w-full pl-9 pr-3 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white text-sm font-medium appearance-none cursor-pointer"
                  >
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs z-10">▼</div>
                </div>
              </div>

            </div>

            {/* Medical Conditions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                Conditions (Optional)
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <FiActivity size={18} />
                </div>
                <textarea
                  value={form.conditions}
                  onChange={e => setForm({...form, conditions: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 text-sm font-medium resize-none"
                  placeholder="e.g. diabetes, high blood pressure (comma separated)"
                  rows="2"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-4"
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
                    Initialize Circle
                    <motion.div className="group-hover:translate-x-1 transition-transform duration-300">
                      <FiArrowRight size={18} />
                    </motion.div>
                  </>
                )}
              </div>
            </motion.button>

          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}