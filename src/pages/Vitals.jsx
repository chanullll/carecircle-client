import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addVital, getVitals, getHealthScore } from '../services/vitalService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity, FiPlus, FiX, FiDownload, FiCpu, FiAlertTriangle, FiInfo,
  FiHeart, FiDroplet, FiWind, FiThermometer, FiCalendar, FiFileText, FiTrendingUp
} from 'react-icons/fi';
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

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('CareCircle Health Report', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${today}`, 105, 30, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Patient Information', 14, 45);

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Name: ${circle?.patient?.name || 'N/A'}`, 14, 55);
    doc.text(`Age: ${circle?.patient?.age || 'N/A'}`, 14, 63);
    doc.text(`Blood Type: ${circle?.patient?.bloodType || 'N/A'}`, 14, 71);
    doc.text(`Conditions: ${circle?.patient?.conditions?.join(', ') || 'None'}`, 14, 79);

    if (healthScore) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('AI Health Score', 14, 95);

      doc.setFontSize(24);
      const scoreColor = healthScore.healthScore >= 80
        ? [16, 185, 129] 
        : healthScore.healthScore >= 60
        ? [245, 158, 11] 
        : [244, 63, 94]; 
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
    toast.success('PDF Report downloaded successfully!');
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
      toast.success('Vitals recorded securely!');
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
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  const getAlertColor = (type, value) => {
    if (type === 'bp' && value > 140) return 'text-rose-500 font-bold';
    if (type === 'sugar' && value > 180) return 'text-rose-500 font-bold';
    if (type === 'oxygen' && value < 92) return 'text-rose-500 font-bold';
    if (type === 'temp' && value > 100.4) return 'text-rose-500 font-bold';
    return 'text-slate-800 dark:text-white font-bold'; 
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };
  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-600 rounded-full" />
    </div>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto space-y-8 relative">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl -z-10">
        <motion.div animate={{ x: [0, 40, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[100px]" />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-emerald-400/10 dark:bg-emerald-600/10 blur-[100px]" />
      </div>

      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <FiActivity className="text-white text-xl" />
            </div>
            Health Vitals
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2">
            Monitor health metrics and AI-driven insights.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={generatePDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-bold tracking-wide shadow-sm"
          >
            <FiDownload size={18} /> Export PDF
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-md hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors text-sm font-bold tracking-wide"
          >
            <FiPlus size={18} /> Record Vitals
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-6">
          {healthScore && (
            <motion.div variants={fadeInUp} className={`backdrop-blur-2xl rounded-3xl border shadow-sm p-6 lg:p-8 ${getScoreBg(healthScore.healthScore)}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-2">
                    <FiCpu className={getScoreColor(healthScore.healthScore)} /> AI Health Score
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-6xl font-extrabold tracking-tighter ${getScoreColor(healthScore.healthScore)}`}>
                      {healthScore.healthScore}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">/100</p>
                  </div>
                  <p className={`text-sm font-bold mt-2 px-3 py-1 rounded-lg inline-block border bg-white/50 dark:bg-slate-900/50 ${getScoreColor(healthScore.healthScore)}`}>
                    Grade: {healthScore.grade}
                  </p>
                </div>
              </div>

              {healthScore.risks?.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Identified Risks</p>
                  {healthScore.risks.map((risk, i) => (
                    <div key={i} className={`p-3.5 rounded-2xl border flex gap-3 ${
                      risk.severity === 'critical' ? 'bg-rose-50/50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300' :
                      risk.severity === 'high' ? 'bg-amber-50/50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300' :
                      'bg-blue-50/50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300'
                    }`}>
                      <FiAlertTriangle className="mt-0.5 shrink-0" size={16} />
                      <p className="text-sm font-medium leading-snug">{risk.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {healthScore.recommendations?.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">AI Recommendations</p>
                  <div className="space-y-2">
                    {healthScore.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-2 items-start bg-white/40 dark:bg-slate-800/40 p-3 rounded-xl border border-white/50 dark:border-slate-700/50">
                        <FiInfo className="mt-0.5 shrink-0 text-blue-500" size={14} />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          
          {chartData.length > 1 && (
            <motion.div variants={fadeInUp} className="backdrop-blur-2xl bg-white/70 dark:bg-slate-800/70 rounded-3xl border border-white/50 dark:border-slate-700/50 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <FiTrendingUp className="text-blue-500" /> Health Trends
              </h2>
              
              <div className="flex bg-slate-200/50 dark:bg-slate-700/50 p-1.5 rounded-2xl backdrop-blur-md w-full overflow-x-auto custom-scrollbar mb-8 border border-slate-300/50 dark:border-slate-600/50">
                {[
                  { key: 'bp', label: 'Blood Pressure', icon: FiHeart },
                  { key: 'sugar', label: 'Blood Sugar', icon: FiDroplet },
                  { key: 'oxygen', label: 'Oxygen', icon: FiWind },
                  { key: 'heart', label: 'Heart Rate', icon: FiActivity },
                ].map(chart => (
                  <button 
                    key={chart.key} 
                    onClick={() => setActiveChart(chart.key)}
                    className="relative flex-1 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 z-10 whitespace-nowrap"
                  >
                    {activeChart === chart.key && (
                      <motion.div
                        layoutId="activeChartTab"
                        className="absolute inset-0 bg-white dark:bg-slate-800 shadow-sm rounded-xl -z-10 border border-slate-200/50 dark:border-slate-700/50"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                    <chart.icon className={activeChart === chart.key ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} size={14} />
                    <span className={activeChart === chart.key ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}>
                      {chart.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChart === 'bp' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis domain={[60, 200]} tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="systolic" stroke="#f43f5e" name="Systolic" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  ) : activeChart === 'sugar' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis domain={[50, 300]} tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="bloodSugar" stroke="#f59e0b" name="Blood Sugar (mg/dL)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  ) : activeChart === 'oxygen' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis domain={[80, 100]} tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="oxygenLevel" stroke="#0ea5e9" name="Oxygen Level (%)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis domain={[40, 150]} tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="heartRate" stroke="#8b5cf6" name="Heart Rate (bpm)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeInUp} className="backdrop-blur-2xl bg-white/70 dark:bg-slate-800/70 rounded-3xl border border-white/50 dark:border-slate-700/50 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <FiCalendar className="text-blue-500" /> Vitals History
            </h2>

            {vitals.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-700">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiActivity className="text-slate-400 text-2xl" />
                </div>
                <p className="text-slate-800 dark:text-white font-bold text-lg mb-1">No vitals recorded yet</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Start tracking your daily health metrics.</p>
                <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md">
                  Record First Vital
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {vitals.map((vital, i) => (
                  <div key={i} className="bg-white/80 dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${vital.abnormalAlert ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    
                    <div className="flex justify-between items-center mb-4 pl-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <FiCalendar size={14} /> 
                        {new Date(vital.createdAt).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {vital.abnormalAlert && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-500/20 flex items-center gap-1">
                          <FiAlertTriangle size={12} /> Abnormal
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pl-2">
                      {vital.bloodPressure?.systolic && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1"><FiHeart /> BP</p>
                          <p className={`font-extrabold text-lg leading-none ${getAlertColor('bp', vital.bloodPressure.systolic)}`}>
                            {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                          </p>
                          <span className="text-[9px] font-semibold text-slate-400 mt-1">mmHg</span>
                        </div>
                      )}
                      {vital.bloodSugar && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1"><FiDroplet /> Sugar</p>
                          <p className={`font-extrabold text-lg leading-none ${getAlertColor('sugar', vital.bloodSugar)}`}>{vital.bloodSugar}</p>
                          <span className="text-[9px] font-semibold text-slate-400 mt-1">mg/dL</span>
                        </div>
                      )}
                      {vital.oxygenLevel && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1"><FiWind /> SpO2</p>
                          <p className={`font-extrabold text-lg leading-none ${getAlertColor('oxygen', vital.oxygenLevel)}`}>{vital.oxygenLevel}%</p>
                          <span className="text-[9px] font-semibold text-slate-400 mt-1">Percent</span>
                        </div>
                      )}
                      {vital.temperature && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1"><FiThermometer /> Temp</p>
                          <p className={`font-extrabold text-lg leading-none ${getAlertColor('temp', vital.temperature)}`}>{vital.temperature}</p>
                          <span className="text-[9px] font-semibold text-slate-400 mt-1">°F</span>
                        </div>
                      )}
                    </div>
                    {vital.notes && (
                      <div className="mt-4 pl-2">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50 flex items-start gap-2">
                          <FiFileText className="mt-0.5 shrink-0" /> {vital.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Record Vitals Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-white/20 dark:border-slate-700 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <FiActivity className="text-blue-600 dark:text-blue-400" />
                  </div>
                  Record New Vitals
                </h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Blood Pressure Section */}
                <div className="bg-rose-50/40 dark:bg-rose-500/5 p-5 rounded-2xl border border-rose-100 dark:border-rose-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                    <FiHeart size={18} /> Blood Pressure
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-5">
                    <div className="flex-1 space-y-1.5">
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Systolic (Top)
                      </label>
                      <input 
                        type="number" 
                        value={form.systolic} 
                        onChange={e => setForm({...form, systolic: e.target.value})} 
                        /* FIXED: Added text-slate-900 dark:text-white to fix contrast */
                        className="w-full px-4 py-3.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-base font-bold text-slate-900 dark:text-white transition-all placeholder-slate-400" 
                        placeholder="120" 
                      />
                    </div>
                    
                    <div className="flex flex-col justify-end h-full pb-3">
                      <span className="text-slate-300 dark:text-slate-600 text-2xl font-light">/</span>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Diastolic (Bottom)
                      </label>
                      <input 
                        type="number" 
                        value={form.diastolic} 
                        onChange={e => setForm({...form, diastolic: e.target.value})} 
                        /* FIXED */
                        className="w-full px-4 py-3.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-base font-bold text-slate-900 dark:text-white transition-all placeholder-slate-400" 
                        placeholder="80" 
                      />
                    </div>
                  </div>
                </div>

                {/* Other Vitals */}
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Additional Metrics (Optional)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { name: 'bloodSugar', label: 'Blood Sugar', icon: FiDroplet, unit: 'mg/dL', placeholder: '110', color: 'text-blue-500' },
                      { name: 'oxygenLevel', label: 'Oxygen (SpO2)', icon: FiWind, unit: '%', placeholder: '98', color: 'text-sky-500' },
                      { name: 'temperature', label: 'Temperature', icon: FiThermometer, unit: '°F', placeholder: '98.6', color: 'text-amber-500' },
                      { name: 'heartRate', label: 'Heart Rate', icon: FiActivity, unit: 'bpm', placeholder: '72', color: 'text-purple-500' },
                    ].map(field => (
                      <div key={field.name} className="space-y-2">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <field.icon className={field.color} /> {field.label}
                        </label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={form[field.name]} 
                            onChange={e => setForm({...form, [field.name]: e.target.value})} 
                            /* FIXED */
                            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-bold text-slate-900 dark:text-white transition-all placeholder-slate-400" 
                            placeholder={field.placeholder} 
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            {field.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <FiFileText className="text-slate-400" /> Clinical Notes
                  </label>
                  <textarea 
                    value={form.notes} 
                    onChange={e => setForm({...form, notes: e.target.value})} 
                    /* FIXED */
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-medium text-slate-900 dark:text-white resize-none transition-all placeholder-slate-400" 
                    placeholder="E.g., After meals, feeling dizzy..." 
                    rows={2} 
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.01 }} 
                    whileTap={{ scale: 0.99 }} 
                    type="submit" 
                    className="flex-[2] bg-slate-900 dark:bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 dark:hover:bg-blue-700 transition-all"
                  >
                    Save Vitals Log
                  </motion.button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}