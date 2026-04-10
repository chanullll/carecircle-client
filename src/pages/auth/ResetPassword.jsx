import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiKey, FiCheckCircle } from 'react-icons/fi';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      toast.success('Password reset successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password!');
    } finally {
      setLoading(false);
    }
  };

  // Smooth animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 selection:bg-blue-500/30 flex items-center justify-center p-4">
      
      {/* Abstract Glowing Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-[120px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        
        {/* Brand Header */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeInUp} 
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 mb-4">
            <FiKey className="text-blue-600 dark:text-blue-400 text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
            Create New Password
          </h1>
        </motion.div>

        {/* Premium Glass Card */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeInUp}
          className="backdrop-blur-2xl bg-white/60 dark:bg-slate-800/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/40 dark:border-slate-700/50 p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />

          {!done ? (
            <>
              <div className="mb-6 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Your new password must be different from previously used passwords.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* New Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <FiLock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 text-sm font-medium"
                      placeholder="Min 6 characters"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <FiLock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 text-sm font-medium"
                      placeholder="Re-enter password"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden bg-slate-900 dark:bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-4"
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
                        Reset Password
                        <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                </motion.button>
              </form>
            </>
          ) : (
            /* Success State UI */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="text-center py-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 dark:bg-green-500/10 mb-6 border border-green-100 dark:border-green-500/20">
                <FiCheckCircle className="text-4xl text-green-500 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Password Updated!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                Your account is now secure. You can sign in with your new password.
              </p>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white py-3.5 rounded-2xl font-semibold text-sm transition-colors shadow-md"
              >
                Proceed to Sign in
              </button>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
}