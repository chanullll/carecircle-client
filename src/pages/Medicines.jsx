import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMedicines, addMedicine, markGiven, getTodayStatus } from '../services/medicineService';
import API from '../services/api';
import { formatTime } from '../utils/helpers';
import { searchMedicines } from '../data/medicines';
import toast from 'react-hot-toast';
import { GiMedicines } from 'react-icons/gi';
import { FiPlus, FiClock, FiPackage, FiCheck, FiAlertTriangle, FiX, FiTrash2, FiSearch } from 'react-icons/fi';

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
    emoji: '💊',
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

  // Medicine search
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

  // Medicine select from search
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
      toast.success('Medicine added! 💊');
      setShowAddForm(false);
      setForm({
        name: '', dosage: '', frequency: 'twice_daily',
        times: ['08:00', '20:00'], stock: 30,
        instructions: '', prescribedBy: '', emoji: '💊', category: ''
      });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add');
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
      toast.success('Marked as given! ✅');
      loadData();
    } catch (error) {
      toast.error('Failed to mark');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Diabetes': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Blood Pressure': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'Cholesterol': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'Pain Relief': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'Antibiotic': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Heart': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
      'Stomach': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'Thyroid': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
      'Respiratory': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
      'Supplement': 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300',
    };
    return colors[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <GiMedicines className="text-purple-500" />
            </div>
            Medicines
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage and track medications
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={checkInteractions}
            className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-4 py-2 rounded-xl hover:bg-orange-100 transition-all text-sm font-medium">
            <FiAlertTriangle size={16} /> Check Interactions
          </button>
          <button onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all text-sm font-medium">
            <FiPlus size={16} /> Add Medicine
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { key: 'today', label: "📅 Today's Status" },
          { key: 'all', label: '💊 All Medicines' }
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Today's Status */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {todayStatus.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
              <span className="text-5xl">💊</span>
              <p className="text-gray-500 dark:text-gray-400 mt-3 mb-4">
                No medicines scheduled for today
              </p>
              <button onClick={() => setShowAddForm(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 text-sm font-medium">
                + Add Medicine
              </button>
            </div>
          ) : (
            todayStatus.map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-2xl">
                      💊
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                        {item.medicine.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.medicine.dosage}
                        {item.medicine.instructions && ` • ${item.medicine.instructions}`}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl ${
                    item.medicine.stock <= 5
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  }`}>
                    <FiPackage size={14} />
                    <span>{item.medicine.stock} left</span>
                    {item.medicine.stock <= 5 && <span>⚠️</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {item.times.map((t, j) => (
                    <div key={j} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      t.status === 'given'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : t.status === 'missed'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      <FiClock size={14} />
                      <span>{formatTime(t.time)}</span>
                      {t.status === 'given' ? (
                        <FiCheck size={14} />
                      ) : t.status === 'pending' ? (
                        <button
                          onClick={() => handleMarkGiven(item.medicine._id, t.time)}
                          className="ml-1 bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700 font-semibold transition-all">
                          Give ✅
                        </button>
                      ) : null}
                      {t.givenBy && (
                        <span className="text-xs opacity-75">by {t.givenBy}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Medicines */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines.length === 0 ? (
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
              <span className="text-5xl">💊</span>
              <p className="text-gray-500 dark:text-gray-400 mt-3">No medicines added yet</p>
            </div>
          ) : (
            medicines.map(med => (
              <div key={med._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-xl">
                      💊
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">{med.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{med.dosage}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    med.isActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {med.isActive ? '✅ Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>🔄 {med.frequency.replace(/_/g, ' ')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {med.times.map((t, i) => (
                      <span key={i} className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-lg text-xs font-medium">
                        ⏰ {formatTime(t)}
                      </span>
                    ))}
                  </div>
                  {med.prescribedBy && <p>👨‍⚕️ {med.prescribedBy}</p>}
                  {med.instructions && <p>📝 {med.instructions}</p>}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <span className={`text-sm font-bold ${
                    med.stock <= 5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    📦 {med.stock} tablets left
                  </span>
                  {med.stock <= 5 && (
                    <span className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
                      ⚠️ Reorder soon!
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Interaction Checker Modal */}
      {showInteractions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FiAlertTriangle className="text-orange-500" />
                Interaction Check
              </h2>
              <button onClick={() => setShowInteractions(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiX size={20} />
              </button>
            </div>

            {checkingInteractions ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">🤖 AI checking interactions...</p>
              </div>
            ) : interactions ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${
                  interactions.totalWarnings === 0
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200'
                }`}>
                  <p className={`font-bold text-lg ${
                    interactions.totalWarnings === 0
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}>
                    {interactions.totalWarnings === 0
                      ? '✅ No dangerous interactions!'
                      : `⚠️ ${interactions.totalWarnings} interaction(s) found!`}
                  </p>
                </div>

                {interactions.drugInteractions?.map((interaction, i) => (
                  <div key={i} className="p-4 rounded-xl border bg-red-50 dark:bg-red-900/20 border-red-200">
                    <p className="font-bold text-red-800 dark:text-red-300">
                      {interaction.medicines?.join(' + ')}
                    </p>
                    <p className="text-sm mt-1 text-red-700 dark:text-red-400">{interaction.effect}</p>
                    {interaction.sinhala && (
                      <p className="text-sm mt-1 font-medium text-red-600">{interaction.sinhala}</p>
                    )}
                  </div>
                ))}

                <button onClick={() => setShowInteractions(false)}
                  className="w-full bg-gray-800 dark:bg-gray-700 text-white py-3 rounded-xl font-medium">
                  Close
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">💊 Add Medicine</h2>
              <button onClick={() => {
                setShowAddForm(false);
                setShowSearch(false);
              }}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-4">
              {/* Medicine Name with Search */}
              <div className="relative" ref={searchRef}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  💊 Medicine Name *
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => handleNameSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Type medicine name..."
                    required />
                </div>

                {/* Search Dropdown */}
                {showSearch && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                    {searchResults.map((med, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectMedicine(med)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left">
                        <span className="text-2xl">{med.emoji}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-white text-sm">
                            {med.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(med.category)}`}>
                              {med.category}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {med.dosages.join(', ')}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-filled info */}
              {form.category && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{form.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        {form.name}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(form.category)}`}>
                        {form.category}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dosage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ⚖️ Dosage *
                </label>
                <input type="text" value={form.dosage}
                  onChange={e => setForm({...form, dosage: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. 500mg" required />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  🔄 Frequency *
                </label>
                <select value={form.frequency}
                  onChange={e => handleFrequencyChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white">
                  <option value="once_daily">Once Daily (1x)</option>
                  <option value="twice_daily">Twice Daily (2x)</option>
                  <option value="thrice_daily">Three Times Daily (3x)</option>
                  <option value="four_times_daily">Four Times Daily (4x)</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>

              {/* Times */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ⏰ Medicine Times
                  </label>
                  <button type="button" onClick={addTime}
                    className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg hover:bg-purple-100 flex items-center gap-1">
                    <FiPlus size={12} /> Add Time
                  </button>
                </div>

                <div className="space-y-2">
                  {form.times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-600">
                        <FiClock size={16} className="text-purple-500" />
                        <input
                          type="time"
                          value={time}
                          onChange={e => updateTime(index, e.target.value)}
                          className="flex-1 bg-transparent focus:outline-none text-gray-800 dark:text-white font-medium" />
                        <span className="text-xs text-gray-400">
                          {(() => {
                            const [h, m] = time.split(':').map(Number);
                            return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
                          })()}
                        </span>
                      </div>
                      {form.times.length > 1 && (
                        <button type="button" onClick={() => removeTime(index)}
                          className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  📦 Stock (tablets)
                </label>
                <input type="number" value={form.stock}
                  onChange={e => setForm({...form, stock: Number(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="30" min="0" />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  📝 Instructions
                </label>
                <input type="text" value={form.instructions}
                  onChange={e => setForm({...form, instructions: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. After meals" />
              </div>

              {/* Prescribed By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  👨‍⚕️ Prescribed By
                </label>
                <input type="text" value={form.prescribedBy}
                  onChange={e => setForm({...form, prescribedBy: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. Dr. Perera" />
              </div>

              {/* Preview */}
              {form.name && form.times.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
                    📋 Preview:
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    <span className="font-bold">{form.emoji} {form.name}</span> {form.dosage}
                  </p>
                  <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                    {form.times.map(t => {
                      const [h, m] = t.split(':').map(Number);
                      return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
                    }).join(' • ')}
                  </p>
                  {form.instructions && (
                    <p className="text-xs text-purple-400 dark:text-purple-500 mt-1">
                      📝 {form.instructions}
                    </p>
                  )}
                </div>
              )}

              <button type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all">
                ✅ Add Medicine
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}