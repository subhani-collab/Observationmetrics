'use client';

import { useState, FormEvent } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (status === 'authenticated') {
    router.replace('/dashboard');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email: email.trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.ok) {
      router.replace('/dashboard');
    } else {
      setError('Invalid credentials or access not permitted.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4">
            <Activity size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">ObserveBoard</h1>
          <p className="text-sm text-slate-500 mt-1">Onboarding Observation Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-7 shadow-xl">
          <h2 className="text-base font-semibold text-slate-200 mb-6">Sign in to continue</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full mt-1">
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-700 mt-5">
          Access is restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
}
