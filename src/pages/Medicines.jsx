import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMedicines, addMedicine, markGiven, getTodayStatus } from '../services/medicineService';
import API from '../services/api';
import { formatTime } from '../utils/helpers';
import { searchMedicines } from '../data/medicines';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiClock, FiPackage, FiCheck, FiAlertTriangle, 
  FiX, FiTrash2, FiSearch, FiLayers, FiCalendar, FiFileText, 
  FiUserPlus, FiRefreshCw, FiSliders
} from 'react-icons/fi';

export default function Medicines() {
  const { currentCircle } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [todayStatus, setTodayStatus] = useState([]);
  const [interactions, setInteractions] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInteractions, setShowInteractions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingInteractions, setCheckingInteractions] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    dosage: '',
    frequency: 'twice_daily',
    times: ['08:00', '20:00'],
    stock: 30,
    instructions: '',
    prescribedBy: '',
    emoji: '💊', // Kept for data structure compatibility, but UI won't rely on it heavily
    category: ''
  });

  useEffect(() => {
    if (currentCircle?._id) loadData();
    else setLoading(false);
  }, [currentCircle]);

  const loadData = async () => {
    try {
      const [medsData, statusData] = await Promise.all([
        getMedicines(currentCircle._id),
        getTodayStatus(currentCircle._id)
      ]);
      setMedicines(medsData.data || []);
      setTodayStatus(statusData.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSearch = (value) => {
    setForm({ ...form, name: value });
    if (value.length >= 2) {
      const results = searchMedicines(value);
      setSearchResults(results);
      setShowSearch(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const selectMedicine = (med) => {
    setForm({
      ...form,
      name: med.name,
      dosage: med.dosages[0],
      instructions: med.instructions,
      emoji: med.emoji,
      category: med.category
    });
    setShowSearch(false);
    setSearchResults([]);
  };

  const handleFrequencyChange = (freq) => {
    const defaultTimes = {
      once_daily: ['08:00'],
      twice_daily: ['08:00', '20:00'],
      thrice_daily: ['08:00', '14:00', '20:00'],
      four_times_daily: ['08:00', '12:00', '16:00', '20:00'],
      as_needed: []
    };
    setForm({ ...form, frequency: freq, times: defaultTimes[freq] || [] });
  };

  const updateTime = (index, value) => {
    const newTimes = [...form.times];
    newTimes[index] = value;
    setForm({ ...form, times: newTimes });
  };

  const addTime = () => {
    if (form.times.length < 6) {
      setForm({ ...form, times: [...form.times, '12:00'] });
    }
  };

  const removeTime = (index) => {
    const newTimes = form.times.filter((_, i) => i !== index);
    setForm({ ...form, times: newTimes });
  };

  const checkInteractions = async () => {
    setCheckingInteractions(true);
    setShowInteractions(true);
    try {
      const { data } = await API.get(`/health/interactions/${currentCircle._id}`);
      setInteractions(data.data);
    } catch (error) {
      toast.error('Failed to check interactions');
    } finally {
      setCheckingInteractions(false);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (form.times.length === 0 && form.frequency !== 'as_needed') {
      toast.error('Please add at least one time!');
      return;
    }
    try {
      await addMedicine({ ...form, circleId: currentCircle._id });
      toast.success('Medicine added successfully!');
      setShowAddForm(false);
      setForm({
        name: '', dosage: '', frequency: 'twice_daily',
        times: ['08:00', '20:00'], stock: 30,
        instructions: '', prescribedBy: '', emoji: '💊', category: ''
      });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add medicine');
    }
  };

  const handleMarkGiven = async (medicineId, time) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await markGiven({
        medicineId,
        circleId: currentCircle._id,
        scheduledTime: time,
        date: today
      });
      toast.success('Marked as given!');
      loadData();
    } catch (error) {
      toast.error('Failed to mark as given');
    }
  };

  // Modernized Category Colors
  const getCategoryColor = (category) => {
    const colors = {
      'Diabetes': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      'Blood Pressure': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      'Cholesterol': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      'Pain Relief': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      'Antibiotic': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      'Heart': 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      'Stomach': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      'Thyroid': 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      'Respiratory': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      'Supplement': 'bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20',
    };
    return colors[category] || 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
  };

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-600 rounded-full" />
    </div>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto space-y-8 relative">
      
      {/* Header Section */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FiLayers className="text-white text-xl" />
            </div>
            Medications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2">
            Manage, track, and monitor drug interactions securely.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={checkInteractions}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-5 py-3 rounded-2xl hover:bg-amber-500/20 transition-colors text-sm font-bold tracking-wide"
          >
            <FiAlertTriangle size={18} /> Check Interactions
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-md hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors text-sm font-bold tracking-wide"
          >
            <FiPlus size={18} /> Add Medicine
          </motion.button>
        </div>
      </motion.div>

      {/* Premium Segmented Control (Tabs) */}
      <motion.div variants={fadeInUp} className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl backdrop-blur-md w-fit border border-slate-300/50 dark:border-slate-700/50 shadow-inner">
        {[
          { key: 'today', label: 'Today\'s Schedule', icon: FiClock },
          { key: 'all', label: 'All Medications', icon: FiLayers }
        ].map(tab => (
          <button 
            key={tab.key} 
            onClick={() => setActiveTab(tab.key)}
            className="relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 z-10"
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeMedTab"
                className="absolute inset-0 bg-white dark:bg-slate-700 shadow-sm rounded-xl -z-10 border border-slate-200/50 dark:border-slate-600/50"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <tab.icon className={activeTab === tab.key ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} size={16} />
            <span className={activeTab === tab.key ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}>
              {tab.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Today's Status Tab */}
      {activeTab === 'today' && (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
          {todayStatus.length === 0 ? (
            <div className="backdrop-blur-2xl bg-white/60 dark:bg-slate-800/60 rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-700 p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="text-slate-400 text-3xl" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">All Clear for Today!</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                No medicines scheduled. Enjoy your day!
              </p>
            </div>
          ) : (
            todayStatus.map((item, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 rounded-3xl shadow-sm border border-white/50 dark:border-slate-700/50 p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <FiLayers className="text-blue-600 dark:text-blue-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
                      {item.medicine.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">
                        {item.medicine.dosage}
                      </span>
                      {item.medicine.instructions && (
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <FiFileText /> {item.medicine.instructions}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end justify-center gap-3 w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-slate-700 pt-4 md:pt-0">
                  {/* Stock Indicator */}
                  <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border ${
                    item.medicine.stock <= 5
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                  }`}>
                    <FiPackage size={14} />
                    <span>{item.medicine.stock} left</span>
                    {item.medicine.stock <= 5 && <FiAlertTriangle className="ml-1" />}
                  </div>

                  {/* Times & Actions */}
                  <div className="flex gap-2 flex-wrap w-full md:justify-end">
                    {item.times.map((t, j) => (
                      <div key={j} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                        t.status === 'given'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                          : t.status === 'missed'
                          ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                      }`}>
                        <FiClock size={12} className={t.status === 'given' ? 'opacity-50' : ''} />
                        <span>{formatTime(t.time)}</span>
                        
                        {t.status === 'given' ? (
                          <FiCheck size={14} className="ml-1" />
                        ) : t.status === 'pending' ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleMarkGiven(item.medicine._id, t.time)}
                            className="ml-2 bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] shadow-sm hover:bg-emerald-600 transition-colors"
                          >
                            Mark Given
                          </motion.button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* All Medicines Tab */}
      {activeTab === 'all' && (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {medicines.length === 0 ? (
            <div className="col-span-full backdrop-blur-2xl bg-white/60 dark:bg-slate-800/60 rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-700 p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLayers className="text-slate-400 text-3xl" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Medicines Added</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Start building your medication library.</p>
            </div>
          ) : (
            medicines.map((med, index) => (
              <motion.div 
                key={med._id} 
                variants={fadeInUp}
                className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 rounded-3xl shadow-sm border border-white/50 dark:border-slate-700/50 p-6 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <FiLayers />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{med.name}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border mt-1 inline-block ${getCategoryColor(med.category)}`}>
                        {med.category || 'General'}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    med.isActive
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600'
                  }`}>
                    {med.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-3 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <FiSliders className="text-slate-400" /> {med.dosage}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <FiRefreshCw className="text-slate-400" /> {med.frequency.replace(/_/g, ' ')}
                  </div>
                  {med.prescribedBy && (
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                      <FiUserPlus className="text-slate-400" /> {med.prescribedBy}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {med.times.map((t, i) => (
                      <span key={i} className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider">
                        {formatTime(t)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <FiPackage /> Stock: <span className={med.stock <= 5 ? 'text-rose-500' : ''}>{med.stock}</span>
                  </div>
                  {med.stock <= 5 && (
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md border border-rose-200 dark:border-rose-500/30">
                      Reorder!
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Interactions Modal (Glassmorphism Overlay) */}
      <AnimatePresence>
        {showInteractions && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-white/20 dark:border-slate-700 max-h-[90vh] overflow-y-auto custom-scrollbar relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                    <FiAlertTriangle className="text-amber-600 dark:text-amber-400" />
                  </div>
                  Interaction Check
                </h2>
                <button onClick={() => setShowInteractions(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 transition-colors">
                  <FiX size={18} />
                </button>
              </div>

              {checkingInteractions ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-3 border-amber-500/30 border-t-amber-500 rounded-full mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Analyzing drug combinations...</p>
                </div>
              ) : interactions ? (
                <div className="space-y-4">
                  <div className={`p-5 rounded-2xl border ${
                    interactions.totalWarnings === 0
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'
                  }`}>
                    <p className={`font-bold text-lg flex items-center gap-2 ${
                      interactions.totalWarnings === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                    }`}>
                      {interactions.totalWarnings === 0 ? <FiCheckCircle /> : <FiAlertTriangle />}
                      {interactions.totalWarnings === 0 ? 'Safe to consume!' : `${interactions.totalWarnings} Warning(s) Found!`}
                    </p>
                  </div>

                  {interactions.drugInteractions?.map((interaction, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                      <h4 className="font-extrabold text-slate-800 dark:text-white mb-2">
                        {interaction.medicines?.join(' + ')}
                      </h4>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                        {interaction.effect}
                      </p>
                      {interaction.sinhala && (
                        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-100 dark:border-rose-500/20 leading-relaxed">
                          {interaction.sinhala}
                        </p>
                      )}
                    </div>
                  ))}

                  <button onClick={() => setShowInteractions(false)} className="w-full bg-slate-900 dark:bg-slate-700 text-white py-3.5 rounded-xl font-bold mt-6 hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">
                    Close Report
                  </button>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Medicine Modal (Glassmorphism Overlay) */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-white/20 dark:border-slate-700 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <FiPlus className="text-blue-600 dark:text-blue-400" />
                  </div>
                  Add Medication
                </h2>
                <button onClick={() => { setShowAddForm(false); setShowSearch(false); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 transition-colors">
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleAddMedicine} className="space-y-5">
                
                {/* Search Box */}
                <div className="relative" ref={searchRef}>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider mb-1.5">
                    Medicine Name *
                  </label>
                  <div className="relative group">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => handleNameSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white font-medium"
                      placeholder="Search or type name..."
                      required 
                    />
                  </div>

                  {/* Search Dropdown */}
                  {showSearch && searchResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-1">
                      {searchResults.map((med, i) => (
                        <button
                          key={i} type="button" onClick={() => selectMedicine(med)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-lg">{med.emoji}</div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">{med.name}</p>
                            <p className="text-xs font-medium text-slate-500">{med.dosages.join(', ')}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Grid for Dosage & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                      Dosage *
                    </label>
                    <div className="relative group">
                      <FiSliders className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                      <input type="text" value={form.dosage} onChange={e => setForm({...form, dosage: e.target.value})} className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white text-sm font-medium" placeholder="e.g. 500mg" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                      Initial Stock
                    </label>
                    <div className="relative group">
                      <FiPackage className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                      <input type="number" value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white text-sm font-medium" placeholder="30" min="0" />
                    </div>
                  </div>
                </div>

                {/* Frequency */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                    Frequency *
                  </label>
                  <div className="relative group">
                    <FiRefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" size={18} />
                    <select value={form.frequency} onChange={e => handleFrequencyChange(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white text-sm font-medium appearance-none cursor-pointer">
                      <option value="once_daily">Once Daily (1x)</option>
                      <option value="twice_daily">Twice Daily (2x)</option>
                      <option value="thrice_daily">Three Times Daily (3x)</option>
                      <option value="four_times_daily">Four Times Daily (4x)</option>
                      <option value="as_needed">As Needed</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs z-10">▼</div>
                  </div>
                </div>

                {/* Time Manager */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Schedule Times
                    </label>
                    <button type="button" onClick={addTime} className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1">
                      <FiPlus size={14} /> Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.times.map((time, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-700">
                          <FiClock size={16} className="text-blue-500" />
                          <input type="time" value={time} onChange={e => updateTime(index, e.target.value)} className="flex-1 bg-transparent focus:outline-none text-slate-800 dark:text-white font-bold" />
                        </div>
                        {form.times.length > 1 && (
                          <button type="button" onClick={() => removeTime(index)} className="w-10 h-10 flex items-center justify-center text-rose-400 hover:text-rose-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 rounded-xl transition-all">
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">Instructions</label>
                    <div className="relative group">
                      <FiFileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                      <input type="text" value={form.instructions} onChange={e => setForm({...form, instructions: e.target.value})} className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white text-sm font-medium" placeholder="e.g. After meals" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">Prescribed By</label>
                    <div className="relative group">
                      <FiUserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                      <input type="text" value={form.prescribedBy} onChange={e => setForm({...form, prescribedBy: e.target.value})} className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white text-sm font-medium" placeholder="e.g. Dr. Perera" />
                    </div>
                  </div>
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-xl font-bold text-sm shadow-md transition-all mt-6">
                  Save Medication
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}