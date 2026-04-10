import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../services/authService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight, FiHeart 
} from 'react-icons/fi';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(form);
      await login(data.data);
      toast.success('Account created! Welcome to CareCircle! 🎉');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed!');
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

  const inputFields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: FiUser, placeholder: 'e.g. Kasun Silva' },
    { name: 'email', label: 'Email', type: 'email', icon: FiMail, placeholder: 'your@email.com' },
    { name: 'phone', label: 'Phone Number', type: 'tel', icon: FiPhone, placeholder: '07X XXX XXXX' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 selection:bg-blue-500/30 py-8 sm:py-12 flex items-center justify-center">
      
      {/* Abstract Glowing Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
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
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 w-full max-w-[480px] px-4">
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          
          {/* Logo & Brand */}
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30 mb-4 relative group"
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-2xl bg-white/20"
              />
              <FiHeart className="text-white text-2xl relative z-10" />
            </motion.div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
              Join <span className="text-blue-600 dark:text-blue-400">CareCircle</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Create your account to get started
            </p>
          </motion.div>

          {/* Premium Glass Card */}
          <motion.div 
            variants={fadeInUp}
            className="backdrop-blur-2xl bg-white/60 dark:bg-slate-800/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/40 dark:border-slate-700/50 p-6 sm:p-10 relative overflow-hidden"
          >
            {/* Subtle inner top highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Standard Inputs (Mapped) */}
              {inputFields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                    {field.label}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <field.icon size={18} />
                    </div>
                    <input
                      type={field.type}
                      value={form[field.name]}
                      onChange={e => setForm({...form, [field.name]: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 text-sm font-medium"
                      placeholder={field.placeholder}
                      required
                    />
                  </div>
                </div>
              ))}

              {/* Password Container (Grid for Desktop, Stack for Mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <FiLock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      className="w-full pl-9 pr-10 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 text-sm font-medium"
                      placeholder="Min 6 chars"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                    Confirm
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <FiLock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={e => setForm({...form, confirmPassword: e.target.value})}
                      className="w-full pl-9 pr-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 text-sm font-medium"
                      placeholder="Re-enter"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-slate-900 dark:bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-6"
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
                      Create Account
                      <motion.div className="group-hover:translate-x-1 transition-transform duration-300">
                        <FiArrowRight size={18} />
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.button>
            </form>
          </motion.div>

          {/* Footer Link */}
          <motion.div 
            variants={fadeInUp}
            className="mt-6 text-center"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}