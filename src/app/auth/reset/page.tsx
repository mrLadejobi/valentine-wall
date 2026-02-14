'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingHearts from '@/components/FloatingHearts';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && isMounted) {
          setErrorMsg(error.message);
        }
      }

      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setReady(!!data.session);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });

    checkSession();

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!success) return;
    setRedirectCountdown(3);
    const t = setInterval(() => {
      setRedirectCountdown((s) => {
        if (s <= 1) {
          clearInterval(t);
          router.push('/dashboard');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [success, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!ready) {
      setErrorMsg('Open the reset link from your email to continue.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-pink-50 to-rose-100 flex items-center justify-center p-6 relative overflow-hidden">
      <FloatingHearts />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl p-10 relative z-10 border border-white"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
            <Lock className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Set New Password</h1>
          <p className="text-gray-500 mt-2 font-medium">
            Choose a strong password to secure your account.
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="flex items-center justify-center text-rose-600 font-bold gap-2">
              <CheckCircle2 size={18} /> Password updated successfully.
            </div>
            <p className="text-gray-500 mt-4 text-sm font-medium">
              Redirecting to your dashboard in {redirectCountdown || 3}s.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 text-xs font-black text-rose-400 hover:text-rose-600 transition-colors uppercase tracking-widest"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="password" required className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-50 rounded-2xl outline-none focus:border-rose-400 transition-all font-medium" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="password" required className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-50 rounded-2xl outline-none focus:border-rose-400 transition-all font-medium" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
            </div>

            {errorMsg && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1">
                <AlertCircle size={14} /> {errorMsg}
              </motion.div>
            )}

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading} 
              className="w-full bg-rose-500 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-6"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
              {!loading && <ArrowRight size={20} />}
            </motion.button>
          </form>
        )}
      </motion.div>
    </main>
  );
}
