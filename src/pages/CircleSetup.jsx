import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createCircle } from '../services/circleService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CircleSetup() {
  const { selectCircle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    patientName: '',
    patientAge: '',
    patientGender: 'male',
    conditions: '',
    bloodType: 'O+'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await createCircle({
        name: form.name,
        patient: {
          name: form.patientName,
          age: Number(form.patientAge),
          gender: form.patientGender,
          conditions: form.conditions.split(',').map(c => c.trim()).filter(Boolean),
          bloodType: form.bloodType
        }
      });
      selectCircle(data.data);
      toast.success('Family Circle created!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create circle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-5xl">👨‍👩‍👧‍👦</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Create Family Circle</h1>
          <p className="text-gray-500 mt-1">Setup your care group</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Circle Name</label>
            <input type="text" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Silva Family" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <input type="text" value={form.patientName}
              onChange={e => setForm({...form, patientName: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Anura Silva" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" value={form.patientAge}
                onChange={e => setForm({...form, patientAge: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="70" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={form.patientGender}
                onChange={e => setForm({...form, patientGender: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
            <select value={form.bloodType}
              onChange={e => setForm({...form, bloodType: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical Conditions (comma separated)
            </label>
            <input type="text" value={form.conditions}
              onChange={e => setForm({...form, conditions: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. diabetes, high blood pressure" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating...' : '✅ Create Family Circle'}
          </button>
        </form>
      </div>
    </div>
  );
}