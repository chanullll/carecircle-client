import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertOctagon, FiPhone, FiX, FiShield, FiTruck, FiLifeBuoy, FiActivity } from 'react-icons/fi';

export default function Emergency() {
  const { currentCircle } = useAuth();
  const [sosLoading, setSosLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [timer, setTimer] = useState(null);

  const startSOS = () => {
    let count = 5;
    setCountdown(count);
    const t = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(t);
        sendSOS();
      }
    }, 1000);
    setTimer(t);
  };

  const cancelSOS = () => {
    if (timer) clearInterval(timer);
    setCountdown(null);
    setTimer(null);
    toast.success('SOS request cancelled');
  };

  const sendSOS = async () => {
    setSosLoading(true);
    setCountdown(null);
    try {
      await API.post('/sos/trigger', {
        circleId: currentCircle._id,
        type: 'other',
        triggerMethod: 'manual',
        notes: 'Emergency SOS triggered!'
      });
      toast.error('SOS Alert sent to all circle members', {
          icon: <FiAlertOctagon className="text-rose-500" />
      });
    } catch (error) {
      toast.error('Failed to send SOS');
    } finally {
      setSosLoading(false);
    }
  };

  // List of emergency contacts with icons
  const emergencyContacts = [
    { name: 'Ambulance', number: '1990', icon: <FiTruck /> },
    { name: 'Suwa Seriya', number: '1990', icon: <FiActivity /> },
    { name: 'Police', number: '119', icon: <FiShield /> },
    { name: 'Fire / Rescue', number: '110', icon: <FiLifeBuoy /> },
  ];

  return (
    <div className="relative min-h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Background Orbs - Rose colored for Emergency */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-400/20 dark:bg-rose-600/10 rounded-full filter blur-[100px] animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-400/20 dark:bg-red-600/10 rounded-full filter blur-[100px] animate-pulse delay-700"></div>

      <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Emergency</h1>
            <p className="text-sm font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest mt-1">SOS & CRISIS ASSISTANCE</p>
        </header>

        {/* SOS Interaction Area */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl rounded-[3rem] border border-white/20 shadow-2xl text-center"
        >
          <AnimatePresence mode="wait">
            {countdown !== null ? (
              <motion.div 
                key="countdown"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="relative flex justify-center items-center">
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute w-32 h-32 bg-rose-500/20 rounded-full"
                    />
                    <p className="text-9xl font-black text-rose-600 dark:text-rose-500 tracking-tighter relative z-10">{countdown}</p>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Broadcasting SOS...</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">All family members will be notified in {countdown} seconds.</p>
                </div>
                <button 
                  onClick={cancelSOS}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <FiX /> Stop SOS Broadcast
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="sos-idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="relative flex justify-center mb-8">
                    {/* Pulsing Rings */}
                    <motion.div 
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute w-40 h-40 bg-rose-500 rounded-full"
                    />
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={startSOS}
                        disabled={sosLoading}
                        className="relative z-10 w-40 h-40 bg-rose-600 text-white rounded-full shadow-2xl shadow-rose-600/40 flex flex-col items-center justify-center gap-1 group"
                    >
                        <FiAlertOctagon size={48} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-2xl font-black uppercase tracking-tighter">{sosLoading ? '...' : 'SOS'}</span>
                    </motion.button>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Emergency Alert</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto text-sm font-medium">
                        Hold for 5 seconds to alert everyone in your CareCircle. 
                    </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Emergency Contacts List */}
        <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-white/10">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase tracking-widest flex items-center gap-2">
                <FiPhone className="text-rose-500" /> Professional Help
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {emergencyContacts.map((contact, i) => (
              <div key={i} className="p-6 flex justify-between items-center group transition-colors hover:bg-white/40 dark:hover:bg-slate-700/40">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-2xl text-2xl">
                    {contact.icon}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{contact.name}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available 24/7</p>
                  </div>
                </div>
                <a 
                    href={`tel:${contact.number}`}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all tracking-tighter text-lg"
                >
                    <FiPhone /> {contact.number}
                </a>
              </div>
            ))}
          </div>
          <div className="p-4 bg-rose-500/10 text-center">
             <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                Always prioritize government emergency services
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}