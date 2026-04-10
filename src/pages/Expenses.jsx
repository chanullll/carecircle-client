import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiPlus, FiActivity, FiUser, FiPlusSquare, FiLayers, FiTool, FiShoppingBag, FiPieChart, FiList } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import ExpenseFormModal from '../components/modals/ExpenseFormModal';

const CATEGORY_MAP = {
  medicine: { icon: <FiLayers />, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', chart: '#3b82f6' },
  doctor: { icon: <FiUser />, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', chart: '#6366f1' },
  hospital: { icon: <FiPlusSquare />, color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', chart: '#f43f5e' },
  tests: { icon: <FiActivity />, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', chart: '#10b981' },
  equipment: { icon: <FiTool />, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', chart: '#f59e0b' },
  other: { icon: <FiShoppingBag />, color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', chart: '#64748b' }
};

export default function Expenses() {
  const { currentCircle } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (currentCircle?._id) loadExpenses();
    else setLoading(false);
  }, [currentCircle]);

  const loadExpenses = async () => {
    try {
      const { data } = await API.get(`/expenses/circle/${currentCircle._id}`);
      const items = data.data || [];
      setExpenses(items.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setTotal(items.reduce((sum, e) => sum + e.amount, 0));

      const categoryTotals = {};
      items.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });
      setChartData(Object.entries(categoryTotals).map(([name, value]) => ({ name, value })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 uppercase font-bold tracking-widest animate-pulse">Analyzing Financials...</div>;

  return (
    <div className="relative min-h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full filter blur-[100px] animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full filter blur-[100px] animate-pulse delay-700"></div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Financials</h1>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">MEDICAL EXPENSE TRACKING</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
          >
            <FiPlus /> Add Expense
          </button>
        </header>

        {/* Total Highlight Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-600/30 text-white relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <FiDollarSign size={120} />
            </div>
            <p className="text-indigo-100 font-bold uppercase tracking-widest text-sm">Total Medical Spend</p>
            <h2 className="text-5xl font-black mt-2 tracking-tighter">Rs. {total.toLocaleString()}</h2>
            <div className="mt-6 flex items-center gap-2 text-indigo-100 text-sm font-medium bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md">
                <FiList size={14} /> {expenses.length} recorded transactions
            </div>
        </motion.div>

        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart Card */}
            <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/20 shadow-xl">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
                <FiPieChart className="text-indigo-500" /> Distribution
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_MAP[entry.name]?.chart || '#cbd5e1'} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      formatter={(val) => `Rs. ${val.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/20 shadow-xl">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-tight">Category Breakdown</h3>
               <div className="space-y-4">
                 {chartData.sort((a,b) => b.value - a.value).map((cat, i) => (
                   <div key={i} className="flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-2xl ${CATEGORY_MAP[cat.name]?.color}`}>
                         {CATEGORY_MAP[cat.name]?.icon}
                       </div>
                       <div>
                         <p className="font-bold text-slate-800 dark:text-slate-100 capitalize">{cat.name}</p>
                         <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }} animate={{ width: `${(cat.value / total) * 100}%` }}
                                className="h-full bg-indigo-500"
                            />
                         </div>
                       </div>
                     </div>
                     <p className="font-black text-slate-800 dark:text-white">Rs. {cat.value.toLocaleString()}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase tracking-widest">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {expenses.map((exp, i) => (
              <motion.div 
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
                key={i} className="p-6 flex justify-between items-center transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl text-xl ${CATEGORY_MAP[exp.category]?.color}`}>
                    {CATEGORY_MAP[exp.category]?.icon}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                      {exp.description || exp.category}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">
                      {new Date(exp.date).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="font-black text-xl text-slate-900 dark:text-white tracking-tighter">Rs. {exp.amount.toLocaleString()}</p>
                    <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">Verified</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && <ExpenseFormModal onClose={() => setShowModal(false)} circleId={currentCircle._id} onSuccess={loadExpenses} />}
      </AnimatePresence>
    </div>
  );
}