import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiPlus, FiX, FiTrash2 } from 'react-icons/fi';

export default function Appointments() {
  const { currentCircle } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    doctorName: '', specialty: '', hospital: '',
    date: '', time: '', reason: ''
  });

  useEffect(() => {
    if (currentCircle?._id) loadAppointments();
    else setLoading(false);
  }, [currentCircle]);

  const loadAppointments = async () => {
    try {
      const { data } = await API.get(`/appointments/circle/${currentCircle._id}`);
      setAppointments(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/appointments', {
        ...form,
        circleId: currentCircle._id,
        date: new Date(form.date + 'T' + form.time).toISOString()
      });
      toast.success('Appointment added!');
      setShowForm(false);
      setForm({ doctorName: '', specialty: '', hospital: '', date: '', time: '', reason: '' });
      loadAppointments();
    } catch (error) {
      toast.error('Failed to add appointment');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/appointments/${id}`);
      toast.success('Deleted!');
      loadAppointments();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
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
          <FiCalendar className="text-blue-500" /> Appointments
        </h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <FiPlus /> Add Appointment
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-gray-500 text-lg">No appointments scheduled</p>
          <button onClick={() => setShowForm(true)}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Add First Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">Dr. {apt.doctorName}</h3>
                  <p className="text-blue-600 text-sm">{apt.specialty}</p>
                  <p className="text-gray-500 text-sm">🏥 {apt.hospital}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    📅 {new Date(apt.date).toLocaleDateString('en-LK', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                  {apt.reason && <p className="text-gray-500 text-sm">📝 {apt.reason}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                  <button onClick={() => handleDelete(apt._id)}
                    className="text-red-400 hover:text-red-600">
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Appointment</h2>
              <button onClick={() => setShowForm(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: 'doctorName', label: 'Doctor Name', placeholder: 'Dr. Silva' },
                { name: 'specialty', label: 'Specialty', placeholder: 'Cardiologist' },
                { name: 'hospital', label: 'Hospital', placeholder: 'Colombo General' },
                { name: 'reason', label: 'Reason', placeholder: 'Follow-up checkup' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input type="text" value={form[field.name]}
                    onChange={e => setForm({...form, [field.name]: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.placeholder}
                    required={field.name === 'doctorName'} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" value={form.time}
                    onChange={e => setForm({...form, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                ✅ Save Appointment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}