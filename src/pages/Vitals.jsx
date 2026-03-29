import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addVital, getVitals } from '../services/vitalService';
import toast from 'react-hot-toast';
import { FiActivity, FiPlus, FiX } from 'react-icons/fi';

export default function Vitals() {
  const { currentCircle } = useAuth();
  const [vitals, setVitals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    systolic: '', diastolic: '',
    bloodSugar: '', temperature: '',
    heartRate: '', oxygenLevel: '', notes: ''
  });

  useEffect(() => {
    if (currentCircle?._id) loadVitals();
    else setLoading(false);
  }, [currentCircle]);

  const loadVitals = async () => {
    try {
      const data = await getVitals(currentCircle._id);
      setVitals(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addVital({
        circleId: currentCircle._id,
        bloodPressure: form.systolic && form.diastolic ? {
          systolic: Number(form.systolic),
          diastolic: Number(form.diastolic)
        } : undefined,
        bloodSugar: form.bloodSugar ? Number(form.bloodSugar) : undefined,
        temperature: form.temperature ? Number(form.temperature) : undefined,
        heartRate: form.heartRate ? Number(form.heartRate) : undefined,
        oxygenLevel: form.oxygenLevel ? Number(form.oxygenLevel) : undefined,
        notes: form.notes
      });
      toast.success('Vitals recorded!');
      setShowForm(false);
      setForm({ systolic: '', diastolic: '', bloodSugar: '', temperature: '', heartRate: '', oxygenLevel: '', notes: '' });
      loadVitals();
    } catch (error) {
      toast.error('Failed to record vitals');
    }
  };

  const getAlertColor = (type, value) => {
    if (type === 'bp' && value > 140) return 'text-red-600';
    if (type === 'sugar' && value > 180) return 'text-red-600';
    if (type === 'oxygen' && value < 92) return 'text-red-600';
    if (type === 'temp' && value > 100.4) return 'text-red-600';
    return 'text-green-600';
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
          <FiActivity className="text-blue-500" /> Vitals Tracking
        </h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <FiPlus /> Record Vitals
        </button>
      </div>

      {vitals.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-gray-500 text-lg">No vitals recorded yet</p>
          <button onClick={() => setShowForm(true)}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Record First Vital
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {vitals.map((vital, i) => (
            <div key={i} className={`bg-white rounded-xl shadow p-5 border-l-4 ${vital.abnormalAlert ? 'border-red-500' : 'border-green-500'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(vital.createdAt).toLocaleDateString('en-LK', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  {vital.abnormalAlert && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      ⚠️ Abnormal Values
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vital.bloodPressure?.systolic && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Blood Pressure</p>
                    <p className={`font-bold text-lg ${getAlertColor('bp', vital.bloodPressure.systolic)}`}>
                      {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                    </p>
                    <p className="text-xs text-gray-400">mmHg</p>
                  </div>
                )}
                {vital.bloodSugar && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Blood Sugar</p>
                    <p className={`font-bold text-lg ${getAlertColor('sugar', vital.bloodSugar)}`}>
                      {vital.bloodSugar}
                    </p>
                    <p className="text-xs text-gray-400">mg/dL</p>
                  </div>
                )}
                {vital.oxygenLevel && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Oxygen Level</p>
                    <p className={`font-bold text-lg ${getAlertColor('oxygen', vital.oxygenLevel)}`}>
                      {vital.oxygenLevel}%
                    </p>
                  </div>
                )}
                {vital.temperature && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Temperature</p>
                    <p className={`font-bold text-lg ${getAlertColor('temp', vital.temperature)}`}>
                      {vital.temperature}°F
                    </p>
                  </div>
                )}
                {vital.heartRate && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Heart Rate</p>
                    <p className="font-bold text-lg text-blue-600">{vital.heartRate}</p>
                    <p className="text-xs text-gray-400">bpm</p>
                  </div>
                )}
              </div>
              {vital.notes && (
                <p className="text-sm text-gray-500 mt-3 italic">📝 {vital.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Record Vitals</h2>
              <button onClick={() => setShowForm(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Systolic BP</label>
                  <input type="number" value={form.systolic}
                    onChange={e => setForm({...form, systolic: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="120" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diastolic BP</label>
                  <input type="number" value={form.diastolic}
                    onChange={e => setForm({...form, diastolic: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="80" />
                </div>
              </div>
              {[
                { name: 'bloodSugar', label: 'Blood Sugar (mg/dL)', placeholder: '110' },
                { name: 'oxygenLevel', label: 'Oxygen Level (%)', placeholder: '98' },
                { name: 'temperature', label: 'Temperature (°F)', placeholder: '98.6' },
                { name: 'heartRate', label: 'Heart Rate (bpm)', placeholder: '72' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input type="number" value={form[field.name]}
                    onChange={e => setForm({...form, [field.name]: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any observations..." rows={3} />
              </div>
              <button type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                ✅ Save Vitals
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}