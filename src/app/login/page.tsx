'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Zap, Lock, Mail, UserPlus } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await authApi.login(email, password);
      } else {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
        res = await authApi.register(name, email, password);
      }
      localStorage.setItem('bf_token', res.access_token);
      localStorage.setItem('bf_user', JSON.stringify(res.user));
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-4 shadow-lg shadow-accent/30">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-white">BillFlow</h1>
          <p className="text-indigo-300 mt-1 text-sm">Professional Billing &amp; Inventory</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-accent text-white shadow' : 'text-indigo-300 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-accent text-white shadow' : 'text-indigo-300 hover:text-white'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm text-indigo-200 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-indigo-400 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    placeholder="Your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-indigo-200 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-indigo-400 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-indigo-200 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-indigo-400 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-indigo-500 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-all text-sm mt-2 shadow-lg shadow-accent/25"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-center text-xs text-indigo-400">
              🔒 Secured with JWT authentication · Powered by Supabase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
