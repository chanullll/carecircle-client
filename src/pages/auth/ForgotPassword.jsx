import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight, FiShield, FiCheckCircle, FiInfo } from 'react-icons/fi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('Reset email sent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email!');
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
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-[50vw] h-[50vw] rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-[120px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        
        {/* Brand Header */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeInUp} 
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 mb-4">
            <FiShield className="text-blue-600 dark:text-blue-400 text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
            Account Recovery
          </h1>
        </motion.div>

        {/* Premium Glass Card */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeInUp}
          className="backdrop-blur-2xl bg-white/60 dark:bg-slate-800/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/40 dark:border-slate-700/50 p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />

          {!sent ? (
            <>
              <div className="mb-6 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Enter your email and we'll send you a secure link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <FiMail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 text-sm font-medium"
                      placeholder="Enter your registered email"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden bg-slate-900 dark:bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all"
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
                        Send Reset Link
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
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Check your inbox</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                We've sent a secure recovery link to <br/>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
              </p>
              
              <div className="flex items-start gap-3 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 text-left mb-6">
                <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                  Link expires in 10 minutes. If you don't see it, please check your spam folder.
                </p>
              </div>

              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Try a different email
              </button>
            </motion.div>
          )}

        </motion.div>

        {/* Back to Login Link */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeInUp}
          className="mt-6 text-center"
        >
          <Link
            to="/login"
            className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            ← Back to Sign in
          </Link>
        </motion.div>

      </div>
    </div>
  );
}