'use client';

import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', {
      email,
      redirect: false,
    });
    if (res?.ok) {
      router.push('/');
    } else {
      setError('Invalid email or user not found.');
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-1">Login</h1>
        <p className="text-gray-600 mb-4">Use your email to sign in.</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-black text-white px-3 py-2 text-sm hover:bg-gray-800"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}


