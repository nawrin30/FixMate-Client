
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/client-auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await authClient.requestPasswordReset({
        email: email.trim().toLowerCase(),
        redirectTo: '/reset-password',
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setMessage('If this email is registered, a reset link will be sent.');
    } catch (error: any) {
      setMessage(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-xl border p-8"
      >
        <h1 className="text-2xl font-bold">Forgot Password?</h1>

        <p className="text-sm text-gray-500">
          Enter your registered email to reset your password.
        </p>

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full rounded-lg border p-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 p-3 text-white disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        {message && (
          <p className="text-sm" role="status">{message}</p>
        )}

        <Link
          href="/sign-in"
          className="block text-center text-sm text-blue-600"
        >
          Back to Sign In
        </Link>
      </form>
    </main>
  );
}
