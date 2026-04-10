import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { joinCircle } from '../services/circleService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiUsers, FiCopy, FiLogOut, FiUserPlus, 
  FiHeart, FiPhone, FiMail, FiShield, FiX, FiCheck 
} from 'react-icons/fi';

// Reusable Input Component for Consistency
const InputGroup = ({ icon, children }) => (
    <div className="relative flex items-center group">
        <div className="absolute left-4 text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none">
            {icon}
        </div>
        {children}
    </div>
);

export default function Settings() {
  const { user, currentCircle, logout } = useAuth();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [relationship, setRelationship] = useState('caregiver');
  const [joining, setJoining] = useState(false);

  const copyInviteCode = () => {
    if (currentCircle?.inviteCode) {
      navigator.clipboard.writeText(currentCircle.inviteCode);
      toast.success('Invite code copied');
    }
  };

  const handleJoinCircle = async (e) => {
    e.preventDefault();
    setJoining(true);
    try {
      await joinCircle(joinCode, relationship);
      toast.success('Joined circle successfully');
      setShowJoinForm(false);
      setJoinCode('');
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="relative min-h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full filter blur-[100px] animate-pulse"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-400/20 dark:bg-sky-600/10 rounded-full filter blur-[100px] animate-pulse delay-700"></div>

      <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
        {/* Header */}
        <header>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">ACCOUNT & CIRCLE PREFERENCES</p>
        </header>

        {/* Profile Section */}
        <section className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-white/10 flex items-center gap-3">
            <FiUser className="text-indigo-500" size={20} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">My Profile</h2>
          </div>
          <div className="p-8 space-y-4">
            {[
              { label: 'Full Name', value: user?.name, icon: <FiUser /> },
              { label: 'Email Address', value: user?.email, icon: <FiMail /> },
              { label: 'Phone Number', value: user?.phone, icon: <FiPhone /> },
              { label: 'System Role', value: user?.role, icon: <FiShield />, capitalize: true },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-white/40 dark:bg-slate-700/30 rounded-2xl border border-white/10 group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 group-hover:text-indigo-500 transition-colors">{item.icon}</span>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">{item.label}</span>
                </div>
                <span className={`font-bold text-slate-800 dark:text-slate-100 ${item.capitalize ? 'capitalize' : ''}`}>
                  {item.value || 'Not provided'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Circle Info Section */}
        {currentCircle && (
          <section className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-white/10 flex items-center gap-3">
              <FiUsers className="text-indigo-500" size={20} />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Family Circle</h2>
            </div>
            <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/40 dark:bg-slate-700/30 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Circle Name</p>
                        <p className="font-bold text-slate-800 dark:text-white mt-1">{currentCircle.name}</p>
                    </div>
                    <div className="p-4 bg-white/40 dark:bg-slate-700/30 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Patient</p>
                        <p className="font-bold text-slate-800 dark:text-white mt-1">{currentCircle.patient?.name}</p>
                    </div>
                </div>

                {/* Invite Code Highlight */}
                <div className="p-6 bg-indigo-600 rounded-[2rem] text-white relative overflow-hidden group">
                  <FiUsers className="absolute -right-4 -bottom-4 text-white/10" size={100} />
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Invite Code</p>
                      <p className="text-3xl font-black tracking-[0.2em] mt-1">{currentCircle.inviteCode}</p>
                    </div>
                    <button 
                      onClick={copyInviteCode}
                      className="p-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl transition-all active:scale-95"
                    >
                      <FiCopy size={24} />
                    </button>
                  </div>
                </div>
                <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    Share this code to add more family members
                </p>
            </div>
          </section>
        )}

        {/* Join Circle Section */}
        <section className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden">
            <div className="p-8">
                {!showJoinForm ? (
                <button 
                    onClick={() => setShowJoinForm(true)}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <FiUserPlus /> Join Another Circle
                </button>
                ) : (
                <form onSubmit={handleJoinCircle} className="space-y-6">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">Join with Invite Code</h2>
                        <button type="button" onClick={() => setShowJoinForm(false)} className="text-slate-400 hover:text-rose-500"><FiX size={20}/></button>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Invite Code</label>
                        <InputGroup icon={<FiShield />}>
                            <input 
                                type="text" 
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                required
                                placeholder="ABC123"
                                // CRITICAL: Input Text Color Applied
                                className="w-full pl-12 pr-4 py-4 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none transition text-center text-2xl font-black tracking-[0.3em]"
                            />
                        </InputGroup>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Your Relationship</label>
                        <InputGroup icon={<FiHeart />}>
                            <select 
                                value={relationship}
                                onChange={e => setRelationship(e.target.value)}
                                // CRITICAL: Select Text Color Applied
                                className="w-full pl-12 pr-4 py-4 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none transition appearance-none font-bold"
                            >
                                {['son', 'daughter', 'spouse', 'parent', 'sibling', 'caregiver', 'other'].map(r => (
                                <option key={r} value={r} className="text-slate-900">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                ))}
                            </select>
                        </InputGroup>
                    </div>

                    <button 
                        type="submit" 
                        disabled={joining}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {joining ? 'Processing...' : <><FiCheck /> Confirm & Join</>}
                    </button>
                </form>
                )}
            </div>
        </section>

        {/* Logout Button */}
        <button 
            onClick={logout}
            className="w-full py-5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 group"
        >
          <FiLogOut className="group-hover:-translate-x-1 transition-transform" /> Sign Out from CareCircle
        </button>
      </div>
    </div>
  );
}