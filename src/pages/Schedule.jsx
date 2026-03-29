import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiClock, FiPlus, FiX } from 'react-icons/fi';

export default function Schedule() {
  const { currentCircle } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (currentCircle?._id) loadSchedule();
    else setLoading(false);
  }, [currentCircle]);

  const loadSchedule = async () => {
    try {
      const { data } = await API.get(`/schedule/circle/${currentCircle._id}`);
      setSchedule(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = async () => {
    setGenerating(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await API.post('/schedule/generate', {
        circleId: currentCircle._id,
        weekStart: today
      });
      setSchedule(data.data);
      toast.success('Smart schedule generated!');
    } catch (error) {
      toast.error('Failed to generate schedule');
    } finally {
      setGenerating(false);
    }
  };

  const getShiftColor = (shift) => {
    const colors = {
      morning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      afternoon: 'bg-orange-100 text-orange-700 border-orange-200',
      evening: 'bg-blue-100 text-blue-700 border-blue-200',
      night: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[shift] || 'bg-gray-100 text-gray-700';
  };

  const getShiftIcon = (shift) => {
    const icons = { morning: '🌅', afternoon: '☀️', evening: '🌆', night: '🌙' };
    return icons[shift] || '⏰';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiClock className="text-blue-500" /> Care Schedule
        </h1>
        <button onClick={generateSchedule} disabled={generating}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {generating ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Generating...</>
          ) : (
            <><FiPlus /> Generate Smart Schedule</>
          )}
        </button>
      </div>

      {!schedule ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-gray-500 text-lg mb-4">No schedule generated yet</p>
          <p className="text-gray-400 text-sm mb-6">
            AI will automatically assign shifts to family members fairly
          </p>
          <button onClick={generateSchedule} disabled={generating}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">
            {generating ? 'Generating...' : '🤖 Generate Smart Schedule'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-700 font-medium">
              📅 Week of {new Date(schedule.weekStart).toLocaleDateString('en-LK', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>

          {schedule.schedule?.map((day, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg mb-3">
                {day.dayName} - {new Date(day.date).toLocaleDateString('en-LK', {
                  month: 'short', day: 'numeric'
                })}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {day.shifts?.map((shift, j) => (
                  <div key={j} className={`p-3 rounded-lg border ${getShiftColor(shift.shift)}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">
                          {getShiftIcon(shift.shift)} {shift.shift.charAt(0).toUpperCase() + shift.shift.slice(1)}
                        </p>
                        {shift.assignedTo ? (
                          <p className="text-xs mt-1 opacity-75">
                            👤 {shift.assignedTo.name || 'Member'}
                            {shift.assignedTo.relationship && ` (${shift.assignedTo.relationship})`}
                          </p>
                        ) : (
                          <p className="text-xs mt-1 opacity-75">⚠️ No one available</p>
                        )}
                      </div>
                      {shift.autoAssigned && (
                        <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded-full">
                          🤖 Auto
                        </span>
                      )}
                    </div>
                    {shift.tasks && shift.tasks.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {shift.tasks.map((task, k) => (
                          <p key={k} className="text-xs opacity-75">• {task}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button onClick={generateSchedule} disabled={generating}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50">
            🔄 Regenerate Schedule
          </button>
        </div>
      )}
    </div>
  );
}