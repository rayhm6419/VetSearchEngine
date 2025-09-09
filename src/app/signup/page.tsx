'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const usernameValid = useMemo(() => /^[A-Za-z0-9_]{3,20}$/.test(username), [username]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!usernameValid) {
      setError('Username must be 3–20 chars (letters, numbers, underscore).');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to sign up');
      }
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-1">Sign Up</h1>
        <p className="text-gray-600 mb-4">Create your account with email and username.</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            required
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className={`w-full rounded-lg border px-3 py-2 text-sm ${username && !usernameValid ? 'border-red-500' : ''}`}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black text-white px-3 py-2 text-sm hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Continue'}
          </button>
        </form>
      </div>
    </main>
  );
}


