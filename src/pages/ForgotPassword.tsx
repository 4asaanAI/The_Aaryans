import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ForgotPassword() {
  const [step, setStep] = useState<'input' | 'success'>('input');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profiles) {
        setError('No account found with this email address');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });

      if (error) throw error;

      setStep('success');
    } catch (err: any) {
      console.error('Error sending reset link:', err);
      setError(err.message || 'Failed to send password reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Link>

        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Key className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 px-2">
            {step === 'input' ? 'Enter your email to receive a password reset link' : 'Check your email for the reset link'}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 sm:p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {step === 'success' ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4 sm:p-6">
              <div className="flex">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm sm:text-base font-medium text-green-800">
                    Reset link sent!
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-green-700">
                    We've sent a password reset link to <strong>{email}</strong>.
                    Please check your email and click the link to reset your password.
                  </p>
                  <p className="mt-2 text-xs sm:text-sm text-green-700">
                    The link will expire in 1 hour.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-xs sm:text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or
              </p>
              <button
                onClick={() => {
                  setStep('input');
                  setError('');
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Try again
              </button>
            </div>

            <Link
              to="/login"
              className="block text-center w-full py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form className="mt-6 sm:mt-8 space-y-6" onSubmit={handleSendResetLink}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 sm:py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
