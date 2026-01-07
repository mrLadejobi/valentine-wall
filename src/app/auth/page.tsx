'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, ArrowRight, Inbox, Sparkles, AlertCircle } from 'lucide-react';
import FloatingHearts from '@/components/FloatingHearts';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State to handle the "Check your mail" message
  const [isEmailSent, setIsEmailSent] = useState(false); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (isLogin) {
      // --- LOGIN LOGIC ---
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } else {
      // --- SIGN UP LOGIC ---
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          // This ensures they come back to your live site after clicking the link
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      } else if (data.user && data.session === null) {
        // SUCCESS: Email confirmation is required
        setIsEmailSent(true);
        setLoading(false);
      } else {
        // SUCCESS: Auto-logged in (if confirmation is turned off in Supabase)
        router.push('/dashboard');
      }
    }
  };

  // --- VIEW 1: THE "GO TO YOUR EMAIL" PROMPT ---
  if (isEmailSent) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-6 relative overflow-hidden">
        <FloatingHearts />
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl p-10 text-center relative z-10 border border-white animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Inbox size={48} className="animate-bounce" />
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mb-4">Check your Mail!</h1>
          
          <div className="space-y-4 mb-10">
            <p className="text-gray-600 leading-relaxed">
              We've sent a magic activation link to:
              <span className="block font-bold text-rose-600 mt-1">{email}</span>
            </p>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3 text-left">
              <Sparkles className="text-amber-500 shrink-0 mt-1" size={18} />
              <p className="text-xs text-amber-800 font-medium">
                Please click the link in that email to confirm your account. You won't be able to log in until you do!
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsEmailSent(false)}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg"
          >
            Got it, back to Login
          </button>
        </div>
      </main>
    );
  }

  // --- VIEW 2: THE SIGN-IN / SIGN-UP FORM ---
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-6 relative overflow-hidden">
      <FloatingHearts />
      
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl p-10 relative z-10 border border-white">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3 group transition-transform hover:rotate-0">
            <Heart className="text-white fill-current" size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            {isLogin ? 'Your secret envelopes are waiting.' : 'Start your digital celebration today.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" required 
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium" 
                placeholder="cupid@love.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" required 
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Thinking...' : (isLogin ? 'Sign In' : 'Create My Account')}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <button 
          onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }} 
          className="w-full mt-8 text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest"
        >
          {isLogin ? "New here? Sign Up" : "Back to Login"}
        </button>
      </div>
    </main>
  );
}