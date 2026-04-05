import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { joinCircle } from '../services/circleService';
import toast from 'react-hot-toast';

export default function JoinCircle() {
  const [inviteCode, setInviteCode] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectCircle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await joinCircle(inviteCode, relationship);
      selectCircle(data.data);
      toast.success('Successfully joined the family circle! 🎉');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join circle. Check the code!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">👨‍👩‍👧‍👦</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Join Family Circle</h1>
          <p className="text-gray-500 mt-1">Enter the invite code to join</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Enter Details</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔑 Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-mono tracking-wider"
                placeholder="ABC123"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1">6-digit code from circle creator</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                👤 Your Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select relationship</option>
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="spouse">Spouse</option>
                <option value="sibling">Sibling</option>
                <option value="parent">Parent</option>
                <option value="caregiver">Caregiver</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Joining...
                </span>
              ) : 'Join Circle →'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Don't have a code?{' '}
              <Link to="/setup" className="text-blue-600 font-medium hover:underline">
                Create your own circle →
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Ask the circle creator to share their 6-digit invite code with you.
          </p>
        </div>
      </div>
    </div>
  );
}