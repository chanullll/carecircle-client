import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMedicines, addMedicine, markGiven, getTodayStatus } from '../services/medicineService';
import API from '../services/api';
import { formatTime } from '../utils/helpers';
import toast from 'react-hot-toast';
import { GiMedicines } from 'react-icons/gi';
import { FiPlus, FiClock, FiPackage, FiCheck, FiAlertTriangle, FiX } from 'react-icons/fi';

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
  const [form, setForm] = useState({
    name: '', dosage: '', frequency: 'twice_daily',
    times: ['08:00', '20:00'], stock: 30,
    instructions: '', prescribedBy: ''
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
    try {
      await addMedicine({ ...form, circleId: currentCircle._id });
      toast.success('Medicine added!');
      setShowAddForm(false);
      setForm({
        name: '', dosage: '', frequency: 'twice_daily',
        times: ['08:00', '20:00'], stock: 30,
        instructions: '', prescribedBy: ''
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

  const getSeverityColor = (severity) => {
    if (severity === 'high') return 'bg-red-50 border-red-300 text-red-800';
    if (severity === 'medium') return 'bg-orange-50 border-orange-300 text-orange-800';
    return 'bg-yellow-50 border-yellow-300 text-yellow-800';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'high') return '🚨';
    if (severity === 'medium') return '⚠️';
    return '💡';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <GiMedicines className="text-blue-500" /> Medicines
        </h1>
        <div className="flex gap-2">
          <button onClick={checkInteractions}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
            <FiAlertTriangle /> Check Interactions
          </button>
          <button onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <FiPlus /> Add Medicine
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['today', 'all'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {tab === 'today' ? "📅 Today's Status" : '💊 All Medicines'}
          </button>
        ))}
      </div>

      {/* Today's Status Tab */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {todayStatus.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <p className="text-4xl mb-4">💊</p>
              <p className="text-gray-500 text-lg">No medicines scheduled for today</p>
              <button onClick={() => setShowAddForm(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                + Add Medicine
              </button>
            </div>
          ) : (
            todayStatus.map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-5 border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{item.medicine.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.medicine.dosage} • {item.medicine.instructions}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    item.medicine.stock <= 5 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    <FiPackage />
                    <span>Stock: {item.medicine.stock}</span>
                    {item.medicine.stock <= 5 && <span>⚠️ Low!</span>}
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {item.times.map((t, j) => (
                    <div key={j} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      t.status === 'given' ? 'bg-green-100 text-green-700' :
                      t.status === 'missed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      <FiClock />
                      <span>{formatTime(t.time)}</span>
                      {t.status === 'given' ? (
                        <FiCheck />
                      ) : t.status === 'pending' ? (
                        <button
                          onClick={() => handleMarkGiven(item.medicine._id, t.time)}
                          className="ml-2 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">
                          Give ✅
                        </button>
                      ) : null}
                      {t.givenBy && (
                        <span className="text-xs ml-1 opacity-75">by {t.givenBy}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Medicines Tab */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines.length === 0 ? (
            <div className="col-span-2 bg-white rounded-xl shadow p-12 text-center">
              <p className="text-4xl mb-4">💊</p>
              <p className="text-gray-500">No medicines added yet</p>
            </div>
          ) : (
            medicines.map(med => (
              <div key={med._id} className="bg-white rounded-xl shadow p-5 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{med.name}</h3>
                    <p className="text-gray-500 text-sm">{med.dosage}</p>
                    <p className="text-gray-400 text-sm">
                      {med.frequency.replace('_', ' ')}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      ⏰ {med.times.map(t => formatTime(t)).join(', ')}
                    </p>
                    {med.prescribedBy && (
                      <p className="text-gray-400 text-sm">👨‍⚕️ {med.prescribedBy}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${
                      med.stock <= 5 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      📦 {med.stock} left
                    </span>
                    {med.stock <= 5 && (
                      <p className="text-xs text-red-500 mt-1">⚠️ Reorder soon!</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    med.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {med.isActive ? '✅ Active' : '❌ Inactive'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Interaction Checker Modal */}
      {showInteractions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiAlertTriangle className="text-orange-500" />
                Medicine Interaction Check
              </h2>
              <button onClick={() => setShowInteractions(false)}>
                <FiX size={24} />
              </button>
            </div>

            {checkingInteractions ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-500">🤖 AI checking interactions...</p>
              </div>
            ) : interactions ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className={`p-4 rounded-xl ${
                  interactions.totalWarnings === 0
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`font-bold text-lg ${
                    interactions.totalWarnings === 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {interactions.totalWarnings === 0
                      ? '✅ No dangerous interactions found!'
                      : `⚠️ ${interactions.totalWarnings} interaction(s) found!`
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Checked {interactions.medicinesChecked?.length || 0} medicines
                  </p>
                </div>

                {/* Drug-Drug Interactions */}
                {interactions.drugInteractions?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3">🔴 Drug Interactions:</h3>
                    <div className="space-y-3">
                      {interactions.drugInteractions.map((interaction, i) => (
                        <div key={i} className={`p-4 rounded-xl border ${getSeverityColor(interaction.severity)}`}>
                          <div className="flex items-start gap-2">
                            <span className="text-xl">{getSeverityIcon(interaction.severity)}</span>
                            <div>
                              <p className="font-bold">
                                {interaction.medicines?.join(' + ')}
                              </p>
                              <p className="text-sm mt-1">{interaction.effect}</p>
                              {interaction.sinhala && (
                                <p className="text-sm mt-1 font-medium">{interaction.sinhala}</p>
                              )}
                              <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-bold ${
                                interaction.severity === 'high' ? 'bg-red-200 text-red-800' :
                                interaction.severity === 'medium' ? 'bg-orange-200 text-orange-800' :
                                'bg-yellow-200 text-yellow-800'
                              }`}>
                                {interaction.severity.toUpperCase()} RISK
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Food Interactions */}
                {interactions.foodInteractions?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3">🍎 Food Interactions:</h3>
                    <div className="space-y-3">
                      {interactions.foodInteractions.map((fi, i) => (
                        <div key={i} className="p-4 rounded-xl border bg-blue-50 border-blue-200">
                          <p className="font-bold text-blue-800">
                            💊 {fi.medicine} + 🍎 {fi.food}
                          </p>
                          <p className="text-sm text-blue-700 mt-1">{fi.effect}</p>
                          {fi.sinhala && (
                            <p className="text-sm text-blue-600 mt-1">{fi.sinhala}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timing Advice */}
                {interactions.timingAdvice?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3">⏰ Timing Advice:</h3>
                    <div className="space-y-2">
                      {interactions.timingAdvice.map((advice, i) => (
                        <div key={i} className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                          <p className="font-medium text-purple-800">💊 {advice.medicine}</p>
                          <p className="text-sm text-purple-600 mt-1">{advice.sinhala}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowInteractions(false)}
                  className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-900">
                  Close
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Medicine</h2>
              <button onClick={() => setShowAddForm(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleAddMedicine} className="space-y-4">
              {[
                { name: 'name', label: '💊 Medicine Name', placeholder: 'e.g. Metformin', required: true },
                { name: 'dosage', label: '⚖️ Dosage', placeholder: 'e.g. 500mg', required: true },
                { name: 'instructions', label: '📝 Instructions', placeholder: 'e.g. After meals' },
                { name: 'prescribedBy', label: '👨‍⚕️ Prescribed By', placeholder: 'e.g. Dr. Perera' },
                { name: 'stock', label: '📦 Stock (tablets)', placeholder: '30', type: 'number' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    value={form[field.name]}
                    onChange={e => setForm({
                      ...form,
                      [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.placeholder}
                    required={field.required} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🔄 Frequency</label>
                <select value={form.frequency}
                  onChange={e => setForm({...form, frequency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="once_daily">Once Daily</option>
                  <option value="twice_daily">Twice Daily</option>
                  <option value="thrice_daily">Three Times Daily</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>
              <button type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                ✅ Add Medicine
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}