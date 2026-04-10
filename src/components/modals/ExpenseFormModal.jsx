import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiTag, FiDollarSign, FiFileText, FiCalendar } from 'react-icons/fi';
import API from '../../services/api';
import toast from 'react-hot-toast';

const InputGroup = ({ icon, children }) => (
    <div className="relative flex items-center group">
        <div className="absolute left-4 text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none">
            {icon}
        </div>
        {children}
    </div>
);

export default function ExpenseFormModal({ onClose, circleId, onSuccess }) {
    const [form, setForm] = useState({
        category: 'medicine', amount: '', description: '', date: new Date().toISOString().split('T')[0]
    });

    const categories = [
        { value: 'medicine', label: 'Medicine' },
        { value: 'doctor', label: 'Doctor' },
        { value: 'hospital', label: 'Hospital' },
        { value: 'tests', label: 'Tests' },
        { value: 'equipment', label: 'Equipment' },
        { value: 'other', label: 'Other' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/expenses', {
                ...form,
                amount: Number(form.amount),
                circleId: circleId
            });
            toast.success('Expense recorded successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to record expense');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8"
            >
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-500/10 rounded-full transition-colors"><FiX size={20} /></button>
                
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Add Expense</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-8 uppercase font-semibold tracking-wider">TRACK YOUR MEDICAL SPENDING</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-tight">Category</label>
                        <InputGroup icon={<FiTag />}>
                            <select 
                                value={form.category} 
                                onChange={e => setForm({...form, category: e.target.value})}
                                className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none transition appearance-none"
                            >
                                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </InputGroup>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-tight">Amount (Rs.)</label>
                        <InputGroup icon={<FiDollarSign />}>
                            <input 
                                type="number" 
                                value={form.amount} 
                                onChange={e => setForm({...form, amount: e.target.value})}
                                placeholder="0.00" required
                                className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            />
                        </InputGroup>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-tight">Description</label>
                        <InputGroup icon={<FiFileText />}>
                            <input 
                                type="text" 
                                value={form.description} 
                                onChange={e => setForm({...form, description: e.target.value})}
                                placeholder="Refill for Metformin"
                                className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            />
                        </InputGroup>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-tight">Date</label>
                        <InputGroup icon={<FiCalendar />}>
                            <input 
                                type="date" 
                                value={form.date} 
                                onChange={e => setForm({...form, date: e.target.value})}
                                className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            />
                        </InputGroup>
                    </div>

                    <button type="submit" className="w-full py-4 font-bold text-white bg-indigo-600 rounded-2xl shadow-lg transform transition-all hover:scale-[1.02] hover:bg-indigo-700 active:scale-95">
                        Save Expense
                    </button>
                </form>
            </motion.div>
        </div>
    );
}