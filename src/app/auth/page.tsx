'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, ArrowRight, CheckCircle2, Inbox } from 'lucide-react';
import FloatingHearts from '@/components/FloatingHearts';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false); // NEW STATE
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // LOGIN LOGIC
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } else {
      // SIGN UP LOGIC
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          // This tells Supabase where to send the user after they click the email link
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        alert(error.message);
        setLoading(false);
      } else if (data.user && data.session === null) {
        // Successful signup, but email confirmation is required
        setIsEmailSent(true);
        setLoading(false);
      } else {
        // Signup worked and auto-logged in (if confirmation is off)
        router.push('/dashboard');
      }
    }
  };

  // --- RENDER "CHECK EMAIL" VIEW ---
  if (isEmailSent) {
    return (
      <main className="min-h-screen bg-linear-to-br from-pink-50 to-rose-100 flex items-center justify-center p-6 relative overflow-hidden">
        <FloatingHearts />
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl p-10 text-center relative z-10 border border-white animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Inbox size={40} className="animate-bounce" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Confirm your Email</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            We've sent a magic link to <span className="font-bold text-rose-600">{email}</span>. 
            Please click the link in your inbox to activate your account.
          </p>
          <button 
            onClick={() => setIsEmailSent(false)}
            className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  // --- RENDER LOGIN/SIGNUP FORM ---
  return (
    <main className="min-h-screen bg-linear-to-br from-pink-50 to-rose-100 flex items-center justify-center p-6 relative overflow-hidden">
      <FloatingHearts />
      
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl p-10 relative z-10 border border-white">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
            <Heart className="text-white fill-current" size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Your Valentines are waiting for you.' : 'Start your own love wall today.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" required className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 transition-all" placeholder="cupid@love.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" required className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 transition-all" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <button disabled={loading} className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors">
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </main>
  );
}