import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';
import { getMyCircles } from '../../services/circleService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, 
  FiHeart, FiActivity, FiTrendingUp, FiShield 
} from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, selectCircle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      await login(data.data);

      try {
        const circlesResponse = await getMyCircles();
        const circles = circlesResponse.data?.data || circlesResponse.data || [];
        if (circles && circles.length > 0) {
          selectCircle(circles[0]);
        }
      } catch (circleError) {
        console.log('No circles found:', circleError);
      }

      toast.success(`Welcome back, ${data.data.name}!`);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed!');
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
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 selection:bg-blue-500/30">
      
      {/* Abstract Glowing Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[40vw] rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-[120px]"
        />
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[420px]"
        >
          
          {/* Logo & Brand */}
          <motion.div variants={fadeInUp} className="text-center mb-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30 mb-5 relative group"
            >
              {/* Subtle heartbeat pulse behind the icon */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-2xl bg-white/20"
              />
              <FiHeart className="text-white text-3xl relative z-10" />
            </motion.div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              Care<span className="text-blue-600 dark:text-blue-400">Circle</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              Intelligent Care Coordination
            </p>
          </motion.div>

          {/* Premium Glass Card */}
          <motion.div 
            variants={fadeInUp}
            className="backdrop-blur-2xl bg-white/60 dark:bg-slate-800/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/40 dark:border-slate-700/50 p-8 sm:p-10 relative overflow-hidden"
          >
            {/* Subtle inner top highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Sign in
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Securely access your family dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                  Email
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
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <FiLock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 text-sm font-medium"
                    placeholder="Enter your password"
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

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-slate-900 dark:bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-4"
              >
                {/* Button Hover Glow Effect */}
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
                      Sign In
                      <motion.div
                        className="group-hover:translate-x-1 transition-transform duration-300"
                      >
                        <FiArrowRight size={18} />
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.button>
            </form>
          </motion.div>

          {/* Premium Feature Indicators (Replacing the boring emoji grid) */}
          <motion.div 
            variants={fadeInUp}
            className="grid grid-cols-3 gap-4 mt-8 px-2"
          >
            {[
              { icon: FiActivity, label: 'Med Track' },
              { icon: FiTrendingUp, label: 'Analytics' },
              { icon: FiShield, label: 'Secure' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/50 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shadow-sm">
                  <feature.icon size={16} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {feature.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer Link */}
          <motion.div 
            variants={fadeInUp}
            className="mt-8 text-center"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Create one
              </Link>
            </p>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}