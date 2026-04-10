import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiPlus, FiTrash2, FiGitBranch, FiFileText, FiStar } from 'react-icons/fi';
import AppointmentFormModal from '../components/modals/AppointmentFormModal';

const getStatusStyle = (status) => {
    switch (status) {
        case 'completed':
            return 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
        case 'cancelled':
            return 'bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300';
        default: // 'upcoming' or any other status
            return 'bg-sky-100/80 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300';
    }
};

export default function Appointments() {
    const { currentCircle } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentCircle?._id) loadAppointments();
        else setLoading(false);
    }, [currentCircle]);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/appointments/circle/${currentCircle._id}`);
            // Sort appointments by date, newest first
            const sortedAppointments = (data.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
            setAppointments(sortedAppointments);
        } catch (error) {
            console.error(error);
            toast.error("Could not fetch appointments.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this appointment?")) {
            try {
                await API.delete(`/appointments/${id}`);
                toast.success('Appointment deleted!');
                loadAppointments();
            } catch (error) {
                toast.error('Failed to delete appointment');
            }
        }
    };

    if (loading) {
        return <div className="text-center p-12">Loading appointments...</div>;
    }

    return (
        <div className="relative min-h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
             {/* Background Orbs */}
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-sky-300/50 dark:bg-sky-500/30 rounded-full filter blur-[100px] opacity-50 animate-pulse"></div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-300/50 dark:bg-indigo-500/30 rounded-full filter blur-[100px] opacity-40 animate-pulse animation-delay-4000"></div>

            <div className="relative z-10 space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Appointments</h1>
                        <p className="mt-1 text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">UPCOMING & PAST DOCTOR VISITS</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 font-semibold text-white bg-indigo-600 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600"
                    >
                        <FiPlus /> New Appointment
                    </button>
                </header>

                {appointments.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12 bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl rounded-2xl shadow-md">
                        <FiCalendar className="mx-auto text-5xl text-slate-400 dark:text-slate-500 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">No Appointments Scheduled</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">Your appointment list is empty. Add your first one to get started.</p>
                        <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 font-semibold text-white bg-indigo-600 rounded-xl shadow-lg hover:scale-105 transition-transform">
                            Add First Appointment
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {appointments.map((apt) => (
                                <motion.div
                                    key={apt._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="p-6 bg-white/60 dark:bg-slate-800/40 backdrop-blur-2xl rounded-2xl shadow-md border border-white/20"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusStyle(apt.status)} capitalize`}>
                                                    {apt.status || 'upcoming'}
                                                </span>
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                    {new Date(apt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white">Dr. {apt.doctorName}</h3>
                                            
                                            <div className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                                                {apt.specialty && <p className="flex items-center gap-2"><FiStar className="text-indigo-500" size={14} /> {apt.specialty}</p>}
                                                {apt.hospital && <p className="flex items-center gap-2"><FiGitBranch className="text-indigo-500" size={14} /> {apt.hospital}</p>}
                                                {apt.reason && <p className="flex items-center gap-2"><FiFileText className="text-indigo-500" size={14} /> {apt.reason}</p>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <button onClick={() => handleDelete(apt._id)} className="p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 rounded-full transition-colors">
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <AppointmentFormModal 
                        onClose={() => setIsModalOpen(false)}
                        circleId={currentCircle?._id}
                        onSuccess={loadAppointments}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}