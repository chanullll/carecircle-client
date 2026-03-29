import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTodayStatus } from '../services/medicineService';
import { getLatestVital, getHealthScore } from '../services/vitalService';
import { FiActivity, FiAlertCircle, FiPlus, FiClock, FiArrowRight } from 'react-icons/fi';
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
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
          <span className="text-4xl">👨‍👩‍👧‍👦</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No family circle found!</p>
        <button onClick={() => navigate('/setup')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
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
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-LK', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
              🏠 {currentCircle.name}
            </span>
            <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
              👤 {currentCircle.patient?.name}
            </span>
          </div>
        </div>
        <button onClick={() => navigate('/emergency')}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all animate-pulse flex items-center gap-2">
          🆘 SOS
        </button>
      </div>

      {/* Next Medicine Reminder */}
      {nextMedicine && (
        <div className="bg-gradient-to-r from-violet-500 via-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiClock size={16} className="text-purple-200" />
                <p className="text-purple-200 text-sm font-medium">Next Medicine</p>
              </div>
              <p className="text-2xl font-bold">💊 {nextMedicine.name}</p>
              <p className="text-purple-200 text-sm mt-1">
                Scheduled at {formatTime(nextMedicine.time)}
              </p>
            </div>
            <div className="text-right bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-purple-200 text-xs mb-1">Time remaining</p>
              <p className="text-2xl font-bold font-mono">{countdown}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Given', value: stats.given, icon: '✅', color: 'from-green-400 to-green-600', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
          { label: 'Pending', value: stats.pending, icon: '⏳', color: 'from-yellow-400 to-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Missed', value: stats.missed, icon: '❌', color: 'from-red-400 to-red-600', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
          healthScore ? {
            label: 'Health Score', value: healthScore.healthScore, icon: '🤖',
            color: healthScore.healthScore >= 80 ? 'from-blue-400 to-blue-600' : 'from-yellow-400 to-orange-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400',
            sub: healthScore.grade
          } : null
        ].filter(Boolean).map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-2xl p-5 border border-white/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-medium ${stat.text} bg-white/60 dark:bg-gray-800/60 px-2 py-0.5 rounded-full`}>
                {stat.label}
              </span>
            </div>
            <p className={`text-4xl font-bold ${stat.text}`}>{stat.value}</p>
            {stat.sub && <p className={`text-xs ${stat.text} mt-1 opacity-75`}>{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Health Alerts */}
      {healthScore?.risks?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="text-red-500" />
              </div>
              AI Health Alerts
            </h2>
            <button onClick={() => navigate('/vitals')}
              className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
              View Details <FiArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {healthScore.risks.map((risk, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${
                risk.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                risk.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' :
                'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              }`}>
                <span>{risk.severity === 'critical' ? '🚨' : risk.severity === 'high' ? '⚠️' : '💡'}</span>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{risk.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Medicine', icon: '💊', path: '/medicines', gradient: 'from-blue-500 to-blue-600' },
            { label: 'Record Vitals', icon: '📊', path: '/vitals', gradient: 'from-green-500 to-green-600' },
            { label: 'Appointment', icon: '📅', path: '/appointments', gradient: 'from-purple-500 to-purple-600' },
            { label: 'Add Expense', icon: '💰', path: '/expenses', gradient: 'from-yellow-500 to-orange-500' },
          ].map((action, i) => (
            <button key={i} onClick={() => navigate(action.path)}
              className={`bg-gradient-to-br ${action.gradient} p-4 rounded-2xl text-white font-medium text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all`}>
              <span className="text-3xl block mb-2">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Today's Medicines */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <GiMedicines className="text-blue-500" />
            </div>
            Today's Medicines
          </h2>
          <button onClick={() => navigate('/medicines')}
            className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
            View All <FiArrowRight size={14} />
          </button>
        </div>

        {todayMeds.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl">💊</span>
            <p className="text-gray-400 dark:text-gray-500 mt-2 mb-4">No medicines scheduled</p>
            <button onClick={() => navigate('/medicines')}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 text-sm font-medium">
              + Add Medicine
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayMeds.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💊</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{item.medicine.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.medicine.dosage}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.times.map((t, j) => (
                    <span key={j} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      t.status === 'given' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      t.status === 'missed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {formatTime(t.time)} {t.status === 'given' ? '✅' : t.status === 'missed' ? '❌' : '⏳'}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Latest Vitals */}
      {latestVital && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FiActivity className="text-green-500" />
              </div>
              Latest Vitals
            </h2>
            <button onClick={() => navigate('/vitals')}
              className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
              View All <FiArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Blood Pressure', value: latestVital.bloodPressure ? `${latestVital.bloodPressure.systolic}/${latestVital.bloodPressure.diastolic}` : null, unit: 'mmHg', icon: '❤️', alert: latestVital.bloodPressure?.systolic > 140 },
              { label: 'Blood Sugar', value: latestVital.bloodSugar, unit: 'mg/dL', icon: '🩸', alert: latestVital.bloodSugar > 180 },
              { label: 'Oxygen Level', value: latestVital.oxygenLevel ? `${latestVital.oxygenLevel}%` : null, unit: '', icon: '💨', alert: latestVital.oxygenLevel < 92 },
              { label: 'Temperature', value: latestVital.temperature ? `${latestVital.temperature}°F` : null, unit: '', icon: '🌡️', alert: latestVital.temperature > 100.4 },
            ].filter(v => v.value).map((vital, i) => (
              <div key={i} className={`rounded-2xl p-4 text-center ${
                vital.alert
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-gray-700/50'
              }`}>
                <span className="text-2xl">{vital.icon}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{vital.label}</p>
                <p className={`font-bold text-lg mt-1 ${vital.alert ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
                  {vital.value}
                </p>
                {vital.alert && <p className="text-xs text-red-500 mt-1">⚠️ High</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}