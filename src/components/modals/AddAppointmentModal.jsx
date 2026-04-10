import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCalendar, FiClock, FiFileText, FiMessageSquare } from 'react-icons/fi';

const InputGroup = ({ icon, children }) => (
    <div className="relative flex items-center group">
        <div className="absolute left-4 text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none">
            {icon}
        </div>
        {children}
    </div>
);

const AddAppointmentModal = ({ onClose }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted!");
        onClose(); 
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()} 
                className="relative w-full max-w-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20"
            >
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-500/20 rounded-full transition-colors z-10"><FiX size={20} /></button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">New Appointment</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Add a new event to the circle's schedule.</p>

                    <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <label htmlFor="title" className="block text-sm font-semibold uppercase text-slate-600 dark:text-slate-400 mb-2">Title</label>
                            <InputGroup icon={<FiFileText />}>
                                <input type="text" id="title" placeholder="e.g., Dr. Smith's Check-up"
                                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition"
                                />
                            </InputGroup>
                        </div>

                        <div>
                            <label htmlFor="date" className="block text-sm font-semibold uppercase text-slate-600 dark:text-slate-400 mb-2">Date</label>
                            <InputGroup icon={<FiCalendar />}>
                                <input type="date" id="date"
                                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition"
                                />
                            </InputGroup>
                        </div>
                        
                        <div>
                            <label htmlFor="time" className="block text-sm font-semibold uppercase text-slate-600 dark:text-slate-400 mb-2">Time</label>
                            <InputGroup icon={<FiClock />}>
                                <input type="time" id="time"
                                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition"
                                />
                            </InputGroup>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="notes" className="block text-sm font-semibold uppercase text-slate-600 dark:text-slate-400 mb-2">Notes</label>
                            <InputGroup icon={<FiMessageSquare />}>
                                <textarea id="notes" rows="3" placeholder="e.g., Bring recent test results"
                                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white rounded-2xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition resize-none"
                                ></textarea>
                            </InputGroup>
                        </div>

                        <div className="sm:col-span-2 flex justify-end pt-4">
                            <button type="submit" className="px-8 py-3 font-semibold text-white bg-indigo-600 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600">Create Appointment</button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default AddAppointmentModal;