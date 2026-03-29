import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';

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
    toast.success('SOS Cancelled');
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
      toast.error('🆘 SOS Alert sent to all family members!');
    } catch (error) {
      toast.error('Failed to send SOS');
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">🆘 Emergency</h1>

      <div className="bg-white rounded-xl shadow p-8 text-center">
        {countdown !== null ? (
          <div className="space-y-4">
            <p className="text-8xl font-bold text-red-600 animate-pulse">{countdown}</p>
            <p className="text-gray-600 text-lg">SOS sending in {countdown} seconds...</p>
            <button onClick={cancelSOS}
              className="bg-gray-800 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-gray-900">
              ❌ Cancel SOS
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-8xl">🆘</p>
            <h2 className="text-2xl font-bold text-gray-800">Emergency SOS</h2>
            <p className="text-gray-500">Press the button to alert all family members</p>
            <button onClick={startSOS} disabled={sosLoading}
              className="w-40 h-40 rounded-full bg-red-600 text-white text-2xl font-bold shadow-xl hover:bg-red-700 active:scale-95 animate-pulse mx-auto flex items-center justify-center disabled:opacity-50">
              {sosLoading ? '...' : '🆘 SOS'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">📞 Emergency Contacts</h2>
        <div className="space-y-3">
          {[
            { name: 'Ambulance', number: '1990', icon: '🚑' },
            { name: 'Police', number: '119', icon: '👮' },
            { name: 'Fire', number: '110', icon: '🚒' },
            { name: 'Suwa Seriya', number: '1990', icon: '🏥' },
          ].map((contact, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{contact.icon}</span>
                <span className="font-medium text-gray-800">{contact.name}</span>
              </div>
              <a href={`tel:${contact.number}`}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700">
                📞 {contact.number}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}