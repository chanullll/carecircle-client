import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTodayStatus } from '../services/medicineService';
import { getLatestVital, getHealthScore } from '../services/vitalService';
import { FiActivity, FiAlertCircle, FiPlus, FiClock } from 'react-icons/fi';
import { GiMedicines } from 'react-icons/gi';
import { formatTime } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, currentCircle } = useAuth();
  const navigate = useNavigate();
  const [todayMeds, setTodayMeds] = useState([]);
  const [latestVital, setLatestVital] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [stats, setStats] = useState({ given: 0, pending: 0, missed: 0 });
  const [loading, setLoading] = useState(false);
  const [nextMedicine, setNextMedicine] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (currentCircle?._id) loadDashboard();
  }, [currentCircle]);

  // Countdown timer
  useEffect(() => {
    if (!nextMedicine) return;
    const interval = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = nextMedicine.time.split(':').map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const diff = target - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextMedicine]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const medsData = await getTodayStatus(currentCircle._id);
      setTodayMeds(medsData.data || []);

      let given = 0, pending = 0, missed = 0;
      const pendingMeds = [];
      (medsData.data || []).forEach(med => {
        med.times.forEach(t => {
          if (t.status === 'given') given++;
          else if (t.status === 'missed') missed++;
          else {
            pending++;
            pendingMeds.push({ name: med.medicine.name, time: t.time });
          }
        });
      });
      setStats({ given, pending, missed });

      // Find next pending medicine
      if (pendingMeds.length > 0) {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const sorted = pendingMeds
          .map(m => {
            const [h, min] = m.time.split(':').map(Number);
            return { ...m, totalMinutes: h * 60 + min };
          })
          .sort((a, b) => a.totalMinutes - b.totalMinutes);
        const next = sorted.find(m => m.totalMinutes > nowMinutes) || sorted[0];
        setNextMedicine(next);
      }

      try {
        const vitalData = await getLatestVital(currentCircle._id);
        setLatestVital(vitalData.data);
      } catch (e) {}

      try {
        const scoreData = await getHealthScore(currentCircle._id);
        setHealthScore(scoreData.data);
      } catch (e) {}

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentCircle) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <span className="text-6xl">👨‍👩‍👧‍👦</span>
        <p className="text-gray-500 text-lg">No family circle found!</p>
        <button onClick={() => navigate('/setup')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 flex items-center gap-2">
          <FiPlus /> Create Family Circle
        </button>
      </div>
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}! 👋</h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-LK', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          <p className="text-blue-600 font-medium mt-1">
            🏠 {currentCircle.name} - Patient: {currentCircle.patient?.name}
          </p>
        </div>
        <button onClick={() => navigate('/emergency')}
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 animate-pulse">
          🆘 SOS
        </button>
      </div>

      {/* Next Medicine Reminder */}
      {nextMedicine && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-purple-200 text-sm flex items-center gap-2">
                <FiClock /> Next Medicine
              </p>
              <p className="text-2xl font-bold mt-1">💊 {nextMedicine.name}</p>
              <p className="text-purple-200 mt-1">
                Scheduled at {formatTime(nextMedicine.time)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-purple-200 text-sm">Time remaining</p>
              <p className="text-3xl font-bold font-mono mt-1">{countdown}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-600 text-sm font-medium">✅ Given</p>
          <p className="text-3xl font-bold text-green-700">{stats.given}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-600 text-sm font-medium">⏳ Pending</p>
          <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm font-medium">❌ Missed</p>
          <p className="text-3xl font-bold text-red-700">{stats.missed}</p>
        </div>
        {healthScore && (
          <div className={`border rounded-xl p-4 ${
            healthScore.healthScore >= 80 ? 'bg-green-50 border-green-200' :
            healthScore.healthScore >= 60 ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <p className="text-sm font-medium text-gray-600">🤖 Health Score</p>
            <p className={`text-3xl font-bold ${
              healthScore.healthScore >= 80 ? 'text-green-700' :
              healthScore.healthScore >= 60 ? 'text-yellow-700' : 'text-red-700'
            }`}>{healthScore.healthScore}</p>
            <p className="text-xs text-gray-500">{healthScore.grade}</p>
          </div>
        )}
      </div>

      {/* Health Alerts */}
      {healthScore?.risks?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiAlertCircle className="text-red-500" /> AI Health Alerts
          </h2>
          <div className="space-y-3">
            {healthScore.risks.map((risk, i) => (
              <div key={i} className={`p-3 rounded-lg border ${
                risk.severity === 'critical' ? 'bg-red-50 border-red-200' :
                risk.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <p className="font-medium text-sm">{risk.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Add Medicine', icon: '💊', path: '/medicines', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
          { label: 'Record Vitals', icon: '📊', path: '/vitals', color: 'bg-green-50 hover:bg-green-100 text-green-700' },
          { label: 'Appointment', icon: '📅', path: '/appointments', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
          { label: 'Add Expense', icon: '💰', path: '/expenses', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700' },
        ].map((action, i) => (
          <button key={i} onClick={() => navigate(action.path)}
            className={`p-4 rounded-xl font-medium text-sm ${action.color} transition-colors`}>
            <span className="text-2xl block mb-1">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>

      {/* Today's Medicines */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <GiMedicines className="text-blue-500" /> Today's Medicines
        </h2>
        {todayMeds.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No medicines scheduled</p>
            <button onClick={() => navigate('/medicines')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              + Add Medicine
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {todayMeds.map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800">{item.medicine.name}</h3>
                <p className="text-sm text-gray-500">{item.medicine.dosage}</p>
                <div className="flex gap-3 flex-wrap mt-2">
                  {item.times.map((t, j) => (
                    <div key={j} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      t.status === 'given' ? 'bg-green-100 text-green-700' :
                      t.status === 'missed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      <span>{formatTime(t.time)}</span>
                      <span>{t.status === 'given' ? '✅' : t.status === 'missed' ? '❌' : '⏳'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Latest Vitals */}
      {latestVital && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiActivity className="text-blue-500" /> Latest Vitals
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {latestVital.bloodPressure && (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl">❤️</p>
                <p className="text-xs text-gray-500 mt-1">Blood Pressure</p>
                <p className="font-bold">{latestVital.bloodPressure.systolic}/{latestVital.bloodPressure.diastolic}</p>
              </div>
            )}
            {latestVital.bloodSugar && (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl">🩸</p>
                <p className="text-xs text-gray-500 mt-1">Blood Sugar</p>
                <p className="font-bold">{latestVital.bloodSugar} mg/dL</p>
              </div>
            )}
            {latestVital.oxygenLevel && (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl">💨</p>
                <p className="text-xs text-gray-500 mt-1">Oxygen</p>
                <p className="font-bold">{latestVital.oxygenLevel}%</p>
              </div>
            )}
            {latestVital.temperature && (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl">🌡️</p>
                <p className="text-xs text-gray-500 mt-1">Temperature</p>
                <p className="font-bold">{latestVital.temperature}°F</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}