import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addVital, getVitals, getHealthScore } from '../services/vitalService';
import toast from 'react-hot-toast';
import { FiActivity, FiPlus, FiX } from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Vitals() {
  const { currentCircle } = useAuth();
  const [vitals, setVitals] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('bp');
  const [form, setForm] = useState({
    systolic: '', diastolic: '',
    bloodSugar: '', temperature: '',
    heartRate: '', oxygenLevel: '', notes: ''
  });

  useEffect(() => {
    if (currentCircle?._id) loadData();
    else setLoading(false);
  }, [currentCircle]);

  const loadData = async () => {
    try {
      const [vitalsData, scoreData] = await Promise.all([
        getVitals(currentCircle._id),
        getHealthScore(currentCircle._id)
      ]);
      setVitals(vitalsData.data || []);
      setHealthScore(scoreData.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const circle = currentCircle;
    const today = new Date().toLocaleDateString('en-LK', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('CareCircle Health Report', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${today}`, 105, 30, { align: 'center' });

    // Patient Info
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Patient Information', 14, 45);

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Name: ${circle?.patient?.name || 'N/A'}`, 14, 55);
    doc.text(`Age: ${circle?.patient?.age || 'N/A'}`, 14, 63);
    doc.text(`Blood Type: ${circle?.patient?.bloodType || 'N/A'}`, 14, 71);
    doc.text(`Conditions: ${circle?.patient?.conditions?.join(', ') || 'None'}`, 14, 79);

    // Health Score
    if (healthScore) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('AI Health Score', 14, 95);

      doc.setFontSize(24);
      const scoreColor = healthScore.healthScore >= 80
        ? [34, 197, 94]
        : healthScore.healthScore >= 60
        ? [234, 179, 8]
        : [239, 68, 68];
      doc.setTextColor(...scoreColor);
      doc.text(`${healthScore.healthScore}/100`, 14, 110);

      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`Grade: ${healthScore.grade}`, 14, 120);

      if (healthScore.recommendations?.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Recommendations:', 14, 132);
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        healthScore.recommendations.forEach((rec, i) => {
          doc.text(`• ${rec}`, 14, 142 + (i * 8));
        });
      }
    }

    // Vitals Table
    if (vitals.length > 0) {
      const startY = healthScore?.recommendations?.length > 0 ? 175 : 140;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Vitals History', 14, startY);

      const tableData = vitals.slice(0, 10).map(v => [
        new Date(v.createdAt).toLocaleDateString('en-LK'),
        v.bloodPressure ? `${v.bloodPressure.systolic}/${v.bloodPressure.diastolic}` : '-',
        v.bloodSugar ? `${v.bloodSugar} mg/dL` : '-',
        v.oxygenLevel ? `${v.oxygenLevel}%` : '-',
        v.temperature ? `${v.temperature}°F` : '-',
        v.heartRate ? `${v.heartRate} bpm` : '-',
        v.abnormalAlert ? 'Abnormal' : 'Normal'
      ]);

      autoTable(doc, {
        startY: startY + 5,
        head: [['Date', 'BP (mmHg)', 'Sugar', 'O2', 'Temp', 'HR', 'Status']],
        body: tableData,
        headStyles: { fillColor: [37, 99, 235] },
        alternateRowStyles: { fillColor: [239, 246, 255] },
        styles: { fontSize: 9 }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `CareCircle Health Report - ${circle?.name} | Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(`CareCircle_Health_Report_${today}.pdf`);
    toast.success('PDF Report downloaded! 📄');
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
      setForm({
        systolic: '', diastolic: '', bloodSugar: '',
        temperature: '', heartRate: '', oxygenLevel: '', notes: ''
      });
      loadData();
    } catch (error) {
      toast.error('Failed to record vitals');
    }
  };

  const chartData = vitals.slice().reverse().map((v, i) => ({
    name: `Day ${i + 1}`,
    date: new Date(v.createdAt).toLocaleDateString('en-LK', {
      month: 'short', day: 'numeric'
    }),
    systolic: v.bloodPressure?.systolic,
    diastolic: v.bloodPressure?.diastolic,
    bloodSugar: v.bloodSugar,
    oxygenLevel: v.oxygenLevel,
    heartRate: v.heartRate,
    temperature: v.temperature,
  }));

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getAlertColor = (type, value) => {
    if (type === 'bp' && value > 140) return 'text-red-600 font-bold';
    if (type === 'sugar' && value > 180) return 'text-red-600 font-bold';
    if (type === 'oxygen' && value < 92) return 'text-red-600 font-bold';
    if (type === 'temp' && value > 100.4) return 'text-red-600 font-bold';
    return 'text-green-600 font-bold';
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
          <FiActivity className="text-blue-500" /> Vitals & Health
        </h1>
        <div className="flex gap-2">
          <button onClick={generatePDF}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            📄 Export PDF
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <FiPlus /> Record Vitals
          </button>
        </div>
      </div>

      {/* Health Score Card */}
      {healthScore && (
        <div className={`rounded-xl border p-6 ${getScoreBg(healthScore.healthScore)}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm font-medium">🤖 AI Health Score</p>
              <p className={`text-6xl font-bold mt-1 ${getScoreColor(healthScore.healthScore)}`}>
                {healthScore.healthScore}
              </p>
              <p className="text-gray-600 mt-1">{healthScore.grade}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Based on {healthScore.vitalsAnalyzed} readings
              </p>
              <p className="text-sm text-gray-500">
                Medicine logs: {healthScore.medicineLogsAnalyzed}
              </p>
            </div>
          </div>

          {healthScore.risks?.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="font-medium text-gray-700">⚠️ Health Alerts:</p>
              {healthScore.risks.map((risk, i) => (
                <div key={i} className={`p-3 rounded-lg text-sm ${
                  risk.severity === 'critical' ? 'bg-red-100 text-red-700' :
                  risk.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {risk.severity === 'critical' ? '🚨' :
                   risk.severity === 'high' ? '⚠️' : '💡'} {risk.message}
                </div>
              ))}
            </div>
          )}

          {healthScore.recommendations?.length > 0 && (
            <div className="mt-4">
              <p className="font-medium text-gray-700 mb-2">💡 Recommendations:</p>
              <div className="space-y-1">
                {healthScore.recommendations.map((rec, i) => (
                  <p key={i} className="text-sm text-gray-600">• {rec}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Health Trends</h2>
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { key: 'bp', label: '❤️ Blood Pressure' },
              { key: 'sugar', label: '🩸 Blood Sugar' },
              { key: 'oxygen', label: '💨 Oxygen Level' },
              { key: 'heart', label: '💓 Heart Rate' },
            ].map(chart => (
              <button key={chart.key} onClick={() => setActiveChart(chart.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeChart === chart.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {chart.label}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={300}>
            {activeChart === 'bp' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[60, 200]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="systolic" stroke="#ef4444"
                  name="Systolic" strokeWidth={2} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6"
                  name="Diastolic" strokeWidth={2} dot={{ r: 5 }} />
              </LineChart>
            ) : activeChart === 'sugar' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[50, 300]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bloodSugar" stroke="#f59e0b"
                  name="Blood Sugar (mg/dL)" strokeWidth={2} dot={{ r: 5 }} />
              </LineChart>
            ) : activeChart === 'oxygen' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[80, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="oxygenLevel" stroke="#06b6d4"
                  name="Oxygen Level (%)" strokeWidth={2} dot={{ r: 5 }} />
              </LineChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[40, 150]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="heartRate" stroke="#8b5cf6"
                  name="Heart Rate (bpm)" strokeWidth={2} dot={{ r: 5 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Vitals History */}
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
          <h2 className="text-lg font-bold text-gray-800">📋 Vitals History</h2>
          {vitals.map((vital, i) => (
            <div key={i} className={`bg-white rounded-xl shadow p-5 border-l-4 ${
              vital.abnormalAlert ? 'border-red-500' : 'border-green-500'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm text-gray-500">
                  📅 {new Date(vital.createdAt).toLocaleDateString('en-LK', {
                    weekday: 'long', year: 'numeric',
                    month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                {vital.abnormalAlert && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                    ⚠️ Abnormal
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vital.bloodPressure?.systolic && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">❤️ Blood Pressure</p>
                    <p className={`font-bold text-lg ${getAlertColor('bp', vital.bloodPressure.systolic)}`}>
                      {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                    </p>
                    <p className="text-xs text-gray-400">mmHg</p>
                  </div>
                )}
                {vital.bloodSugar && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">🩸 Blood Sugar</p>
                    <p className={`font-bold text-lg ${getAlertColor('sugar', vital.bloodSugar)}`}>
                      {vital.bloodSugar}
                    </p>
                    <p className="text-xs text-gray-400">mg/dL</p>
                  </div>
                )}
                {vital.oxygenLevel && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">💨 Oxygen</p>
                    <p className={`font-bold text-lg ${getAlertColor('oxygen', vital.oxygenLevel)}`}>
                      {vital.oxygenLevel}%
                    </p>
                  </div>
                )}
                {vital.temperature && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">🌡️ Temperature</p>
                    <p className={`font-bold text-lg ${getAlertColor('temp', vital.temperature)}`}>
                      {vital.temperature}°F
                    </p>
                  </div>
                )}
                {vital.heartRate && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">💓 Heart Rate</p>
                    <p className="font-bold text-lg text-blue-600">
                      {vital.heartRate}
                    </p>
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

      {/* Record Vitals Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">📊 Record Vitals</h2>
              <button onClick={() => setShowForm(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ❤️ Systolic BP
                  </label>
                  <input type="number" value={form.systolic}
                    onChange={e => setForm({...form, systolic: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="120" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ❤️ Diastolic BP
                  </label>
                  <input type="number" value={form.diastolic}
                    onChange={e => setForm({...form, diastolic: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="80" />
                </div>
              </div>
              {[
                { name: 'bloodSugar', label: '🩸 Blood Sugar (mg/dL)', placeholder: '110' },
                { name: 'oxygenLevel', label: '💨 Oxygen Level (%)', placeholder: '98' },
                { name: 'temperature', label: '🌡️ Temperature (°F)', placeholder: '98.6' },
                { name: 'heartRate', label: '💓 Heart Rate (bpm)', placeholder: '72' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input type="number" value={form[field.name]}
                    onChange={e => setForm({...form, [field.name]: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📝 Notes
                </label>
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