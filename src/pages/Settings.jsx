import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { joinCircle } from '../services/circleService';
import toast from 'react-hot-toast';
import { FiUser, FiUsers, FiCopy, FiLogOut, FiUserPlus } from 'react-icons/fi';

export default function Settings() {
  const { user, currentCircle, logout } = useAuth();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [relationship, setRelationship] = useState('caregiver');
  const [joining, setJoining] = useState(false);

  const copyInviteCode = () => {
    if (currentCircle?.inviteCode) {
      navigator.clipboard.writeText(currentCircle.inviteCode);
      toast.success('Invite code copied!');
    }
  };

  const handleJoinCircle = async (e) => {
    e.preventDefault();
    setJoining(true);
    try {
      await joinCircle(joinCode, relationship);
      toast.success('Joined circle successfully!');
      setShowJoinForm(false);
      setJoinCode('');
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <FiUser className="text-blue-500" /> Settings
      </h1>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiUser /> My Profile
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-800">{user?.name}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-800">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500">Phone</span>
            <span className="font-medium text-gray-800">{user?.phone}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-gray-800 capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Circle Info */}
      {currentCircle && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiUsers /> Family Circle
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Circle Name</span>
              <span className="font-medium text-gray-800">{currentCircle.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Patient</span>
              <span className="font-medium text-gray-800">{currentCircle.patient?.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Age</span>
              <span className="font-medium text-gray-800">{currentCircle.patient?.age}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Blood Type</span>
              <span className="font-medium text-gray-800">{currentCircle.patient?.bloodType}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Conditions</span>
              <span className="font-medium text-gray-800">
                {currentCircle.patient?.conditions?.join(', ') || 'None'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Members</span>
              <span className="font-medium text-gray-800">
                {currentCircle.members?.length || 1}
              </span>
            </div>

            {/* Invite Code */}
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="text-sm text-blue-600 font-medium">Invite Code</p>
                <p className="text-2xl font-bold text-blue-700 tracking-wider">
                  {currentCircle.inviteCode}
                </p>
              </div>
              <button onClick={copyInviteCode}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FiCopy /> Copy
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Share this code with family members to let them join your circle
            </p>
          </div>
        </div>
      )}

      {/* Join Circle */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiUserPlus /> Join Another Circle
        </h2>
        {!showJoinForm ? (
          <button onClick={() => setShowJoinForm(true)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2">
            <FiUserPlus /> Join with Invite Code
          </button>
        ) : (
          <form onSubmit={handleJoinCircle} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
              <input type="text" value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-wider font-bold"
                placeholder="ABC123" maxLength={6} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Relationship</label>
              <select value={relationship}
                onChange={e => setRelationship(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                {['son', 'daughter', 'spouse', 'parent', 'sibling', 'caregiver', 'other'].map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={joining}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
                {joining ? 'Joining...' : '✅ Join Circle'}
              </button>
              <button type="button" onClick={() => setShowJoinForm(false)}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Logout */}
      <button onClick={logout}
        className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-medium hover:bg-red-100 border border-red-200 flex items-center justify-center gap-2">
        <FiLogOut /> Logout
      </button>
    </div>
  );
}