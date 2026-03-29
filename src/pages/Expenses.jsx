import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiDollarSign, FiPlus, FiX } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#22c55e', '#6b7280'];

export default function Expenses() {
  const { currentCircle } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [form, setForm] = useState({
    category: 'medicine', amount: '', description: '', date: ''
  });

  useEffect(() => {
    if (currentCircle?._id) loadExpenses();
    else setLoading(false);
  }, [currentCircle]);

  const loadExpenses = async () => {
    try {
      const { data } = await API.get(`/expenses/circle/${currentCircle._id}`);
      const items = data.data || [];
      setExpenses(items);
      setTotal(items.reduce((sum, e) => sum + e.amount, 0));

      // Pie chart data
      const categoryTotals = {};
      items.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });
      setChartData(
        Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/expenses', {
        ...form,
        amount: Number(form.amount),
        circleId: currentCircle._id
      });
      toast.success('Expense added!');
      setShowForm(false);
      setForm({ category: 'medicine', amount: '', description: '', date: '' });
      loadExpenses();
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  const getCategoryIcon = (cat) => {
    const icons = {
      medicine: '💊', doctor: '👨‍⚕️', hospital: '🏥',
      tests: '🧪', equipment: '🦽', other: '📦'
    };
    return icons[cat] || '📦';
  };

  const getCategoryColor = (cat) => {
    const colors = {
      medicine: 'bg-blue-100 text-blue-700',
      doctor: 'bg-purple-100 text-purple-700',
      hospital: 'bg-red-100 text-red-700',
      tests: 'bg-yellow-100 text-yellow-700',
      equipment: 'bg-green-100 text-green-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[cat] || colors.other;
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
          <FiDollarSign className="text-blue-500" /> Expenses
        </h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <FiPlus /> Add Expense
        </button>
      </div>

      {/* Total Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <p className="text-blue-100 text-sm">Total Medical Expenses</p>
        <p className="text-4xl font-bold mt-1">Rs. {total.toLocaleString()}</p>
        <p className="text-blue-100 text-sm mt-1">{expenses.length} transactions</p>
      </div>

      {/* Charts & Stats */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Expense Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Summary */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Category Summary</h2>
            <div className="space-y-3">
              {chartData
                .sort((a, b) => b.value - a.value)
                .map((cat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getCategoryIcon(cat.name)}</span>
                      <div>
                        <p className="font-medium text-gray-800 capitalize">{cat.name}</p>
                        <p className="text-xs text-gray-400">
                          {((cat.value / total) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-800">Rs. {cat.value.toLocaleString()}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Expense List */}
      {expenses.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-4xl mb-4">💰</p>
          <p className="text-gray-500 text-lg">No expenses recorded yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow">
          <h2 className="text-lg font-bold text-gray-800 p-6 pb-3">📋 Recent Expenses</h2>
          <div className="divide-y divide-gray-100">
            {expenses.map((exp, i) => (
              <div key={i} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{getCategoryIcon(exp.category)}</span>
                  <div>
                    <p className="font-medium text-gray-800">
                      {exp.description || exp.category}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(exp.category)}`}>
                        {exp.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(exp.date).toLocaleDateString('en-LK', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="font-bold text-gray-800 text-lg">
                  Rs. {exp.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">💰 Add Expense</h2>
              <button onClick={() => setShowForm(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['medicine', 'doctor', 'hospital', 'tests', 'equipment', 'other'].map(c => (
                    <option key={c} value={c}>
                      {getCategoryIcon(c)} {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.)</label>
                <input type="number" value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Metformin refill" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                ✅ Save Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}