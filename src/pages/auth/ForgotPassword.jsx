import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('Reset email sent! Check your inbox! 📧');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">CareCircle</h1>
          <p className="text-gray-500 mt-1">Family Care Coordination</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

          {!sent ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📧 Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </span>
                  ) : 'Send Reset Link →'}
                </button>
              </form>
            </>
          ) : (
            // Email sent success state
            <div className="text-center py-4">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Check Your Email!</h2>
              <p className="text-gray-500 text-sm mb-6">
                We sent a password reset link to <strong>{email}</strong>. 
                The link expires in <strong>10 minutes</strong>.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-6">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Check your spam/junk folder if you don't see the email.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-blue-600 text-sm font-medium hover:underline">
                Try different email →
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}