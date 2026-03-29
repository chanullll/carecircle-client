import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMedicines, addMedicine, markGiven, getTodayStatus } from '../services/medicineService';
import { formatTime, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';
import { GiMedicines } from 'react-icons/gi';
import { FiPlus, FiClock, FiPackage, FiCheck, FiX } from 'react-icons/fi';

export default function Medicines() {
  const { currentCircle } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [todayStatus, setTodayStatus] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [form, setForm] = useState({
    name: '', dosage: '', frequency: 'twice_daily',
    times: ['08:00', '20:00'], stock: 30,
    instructions: '', prescribedBy: ''
  });

  useEffect(() => {
    if (currentCircle) loadData();
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

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      await addMedicine({ ...form, circleId: currentCircle._id });
      toast.success('Medicine added!');
      setShowAddForm(false);
      setForm({ name: '', dosage: '', frequency: 'twice_daily', times: ['08:00', '20:00'], stock: 30, instructions: '', prescribedBy: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add');
    }
  };

  const handleMarkGiven = async (medicineId, time) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await markGiven({ medicineId, circleId: currentCircle._id, scheduledTime: time, date: today });
      toast.success('Marked as given!');
      loadData();
    } catch (error) {
      toast.error('Failed to mark');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <GiMedicines className="text-blue-500" /> Medicines
        </h1>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <FiPlus /> Add Medicine
        </button>
      </div>

      <div className="flex gap-2">
        {['today', 'all'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {tab === 'today' ? "Today's Status" : 'All Medicines'}
          </button>
        ))}
      </div>

      {activeTab === 'today' ? (
        <div className="space-y-4">
          {todayStatus.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No medicines scheduled for today</p>
          ) : (
            todayStatus.map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-5 border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{item.medicine.name}</h3>
                    <p className="text-sm text-gray-500">{item.medicine.dosage} - {item.medicine.instructions}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <FiPackage className="text-gray-400" />
                    <span className={item.medicine.stock <= 5 ? 'text-red-600 font-bold' : 'text-gray-500'}>
                      Stock: {item.medicine.stock}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {item.times.map((t, j) => (
                    <div key={j} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      t.status === 'given' ? 'bg-green-100 text-green-700' :
                      t.status === 'missed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'}`}>
                      <FiClock />
                      <span>{formatTime(t.time)}</span>
                      {t.status === 'given' ? <FiCheck /> : t.status === 'pending' && (
                        <button onClick={() => handleMarkGiven(item.medicine._id, t.time)}
                          className="ml-2 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">
                          Give
                        </button>
                      )}
                      {t.givenBy && <span className="text-xs ml-1">by {t.givenBy}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines.map(med => (
            <div key={med._id} className="bg-white rounded-xl shadow p-5 border border-gray-100">
              <h3 className="font-semibold text-lg">{med.name}</h3>
              <p className="text-gray-500">{med.dosage} - {med.frequency.replace('_', ' ')}</p>
              <p className="text-sm text-gray-400 mt-1">Times: {med.times.map(t => formatTime(t)).join(', ')}</p>
              <p className="text-sm text-gray-400">Prescribed by: {med.prescribedBy || 'N/A'}</p>
              <div className="flex justify-between items-center mt-3">
                <span className={`text-sm font-medium ${med.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                  Stock: {med.stock} tablets
                </span>
                <span className={`px-2 py-1 rounded text-xs ${med.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {med.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Medicine</h2>
              <button onClick={() => setShowAddForm(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleAddMedicine} className="space-y-4">
              {[
                { name: 'name', label: 'Medicine Name', placeholder: 'e.g. Metformin', type: 'text' },
                { name: 'dosage', label: 'Dosage', placeholder: 'e.g. 500mg', type: 'text' },
                { name: 'instructions', label: 'Instructions', placeholder: 'e.g. After meals', type: 'text' },
                { name: 'prescribedBy', label: 'Prescribed By', placeholder: 'e.g. Dr. Perera', type: 'text' },
                { name: 'stock', label: 'Stock (tablets)', placeholder: '30', type: 'number' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input type={field.type} value={form[field.name]} onChange={e => setForm({...form, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={field.placeholder} required={field.name === 'name' || field.name === 'dosage'} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="once_daily">Once Daily</option>
                  <option value="twice_daily">Twice Daily</option>
                  <option value="thrice_daily">Three Times Daily</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                Add Medicine
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}