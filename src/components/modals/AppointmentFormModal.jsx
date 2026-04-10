import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUser, FiStar, FiGitBranch, FiFileText, FiCalendar, FiClock } from 'react-icons/fi';
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

export default function AppointmentFormModal({ onClose, circleId, onSuccess }) {
    const [form, setForm] = useState({
        doctorName: '', specialty: '', hospital: '',
        date: '', time: '', reason: ''
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/appointments', {
                ...form,
                circleId: circleId,
                date: new Date(form.date + 'T' + (form.time || '00:00')).toISOString()
            });
            toast.success('Appointment added successfully!');
            onSuccess(); // This will call loadAppointments in the parent
            onClose();
        } catch (error) {
            toast.error('Failed to add appointment');
        }
    };

    const formFields = [
        { name: 'doctorName', label: 'Doctor Name', placeholder: 'Dr. Silva', icon: <FiUser />, required: true },
        { name: 'specialty', label: 'Specialty', placeholder: 'Cardiologist', icon: <FiStar /> },
        { name: 'hospital', label: 'Hospital / Clinic', placeholder: 'General Hospital, Colombo', icon: <FiGitBranch /> },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20"
            >
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-500/20 rounded-full transition-colors z-10"><FiX size={20} /></button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">New Appointment</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Fill in the details for the new appointment.</p>
                    
                    <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {formFields.map(field => (
                            <div key={field.name} className="sm:col-span-2">
                                <label htmlFor={field.name} className="block text-sm font-semibold uppercase text-slate-600 dark:text-slate-400 mb-2">{field.label}</label>
                                <InputGroup icon={field.icon}>
                                    <input type="text" name={field.name} id={field.name} value={form[field.name]} onChange={handleChange} placeholder={field.placeholder} required={field.required}
                                        className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition" />
                                </InputGroup>
                            </div>
                        ))}
                        
                        <div className="sm:col-span-1">
                            <label htmlFor="date" className="block text-sm font-semibold uppercase text-slate-600 dark:text-slate-400 mb-2">Date</label>
                            <InputGroup icon={<FiCalendar />}>
                                <input type="date" name="date" id="date" value={form.date} onChange={handleChange} required
                                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition" />
                            </InputGroup>
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="time" className="block text-sm font-semibold uppercase text-slate-600 dark:text-slate-400 mb-2">Time</label>
                            <InputGroup icon={<FiClock />}>
                                <input type="time" name="time" id="time" value={form.time} onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition" />
                            </InputGroup>
                        </div>
                        
                        <div className="sm:col-span-2">
                           <label htmlFor="reason" className="block text-sm font-semibold uppercase text-slate-600 dark:text-slate-400 mb-2">Reason for Visit</label>
                            <InputGroup icon={<FiFileText />}>
                                <textarea name="reason" id="reason" value={form.reason} onChange={handleChange} rows="3" placeholder="e.g., Annual check-up, follow-up"
                                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition resize-none"></textarea>
                            </InputGroup>
                        </div>

                        <div className="sm:col-span-2 flex justify-end pt-4">
                            <button type="submit" className="px-8 py-3 font-semibold text-white bg-indigo-600 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600">Save Appointment</button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}