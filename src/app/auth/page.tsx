'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, ArrowRight, Inbox, Sparkles, AlertCircle, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
import FloatingHearts from '@/components/FloatingHearts';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false); // DEFAULT TO SIGN UP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const redirectUrl = `${window.location.origin}/dashboard`;

    if (isLogin) {
      // --- LOGIN ---
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { 
        setErrorMsg(error.message); 
        setLoading(false); 
      } else { 
        router.push('/dashboard'); 
      }
    } else {
      // --- SIGN UP ---
      const { data, error } = await supabase.auth.signUp({ 
        email, password,
        options: { 
          emailRedirectTo: redirectUrl, 
          data: { full_name: fullName } 
        }
      });

      if (error) { 
        setErrorMsg(error.message); 
        setLoading(false); 
      } else if (data.user && data.session === null) {
        setIsEmailSent(true);
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-pink-50 to-rose-100 flex items-center justify-center p-6 relative overflow-hidden">
      <FloatingHearts />
      
      <AnimatePresence mode="wait">
        {isEmailSent ? (
          /* --- SUCCESS / CHECK MAIL VIEW --- */
          <motion.div 
            key="email-sent"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl p-10 text-center relative z-10 border border-white"
          >
            <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Inbox size={48} />
              </motion.div>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Check your Mail!</h1>
            <p className="text-gray-600 mb-8 font-medium leading-relaxed px-4">
              We've sent a magic link to <span className="text-rose-600 font-bold">{email}</span>. Click it to verify your wall!
            </p>
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setIsEmailSent(false)}
              className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              Back to Login
            </motion.button>
          </motion.div>
        ) : (
          /* --- LOGIN / SIGNUP VIEW --- */
          <motion.div 
            key="auth-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl p-10 relative z-10 border border-white"
          >
            <div className="text-center mb-10">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.7 }} className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
                <Heart className="text-white fill-current" size={32} />
              </motion.div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-gray-500 mt-2 font-medium">
                {isLogin ? 'Your friends are waiting.' : 'Start your digital celebration today.'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2 animate-in slide-in-from-left-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" required className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-50 rounded-2xl outline-none focus:border-rose-400 transition-all font-medium" placeholder="Your Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" required className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-50 rounded-2xl outline-none focus:border-rose-400 transition-all font-medium" placeholder="cupid@love.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 px-1">Secret Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="password" required className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-50 rounded-2xl outline-none focus:border-rose-400 transition-all font-medium" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>

              {errorMsg && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-500 text-[10px] font-bold flex items-center gap-1 ml-1 bg-red-50 p-2 rounded-lg border border-red-100 uppercase tracking-tighter">
                  <AlertCircle size={14} /> {errorMsg}
                </motion.div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                disabled={loading} 
                className="w-full bg-rose-500 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-6"
              >
                {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Enter App' : 'Get My Link')}
                {!loading && <Sparkles size={20} />}
              </motion.button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
              <button 
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }} 
                className="text-xs font-black text-rose-400 hover:text-rose-600 transition-colors uppercase tracking-widest"
              >
                {isLogin ? "New? Click here to sign up" : "Already have a wall? Login"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}