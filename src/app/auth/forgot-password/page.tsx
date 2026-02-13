'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Loader2, Sparkles, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingHearts from '@/components/FloatingHearts';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // We'll use the verify page as the redirect target, passing the email
    // However, for pure OTP flow, Supabase sends a code. 
    // If using magic link, we'd need a redirect URL.
    // For this implementation, we'll assume OTP code for simplicity/mobile-friendliness
    // but the signInWithOtp can also just send a link.
    // Let's use OTP Token flow.

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create new users, only allow existing
      }
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Redirect to verify page after a short delay or let user click
      setTimeout(() => {
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      }, 2000);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-pink-50 to-rose-100 flex items-center justify-center p-6 relative overflow-hidden">
      <FloatingHearts />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl p-10 relative z-10 border border-white"
      >
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Forgot Password?
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-sm">
            No worries! Enter your email and we&apos;ll send you a code to reset it.
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={40} />
            </div>
            <p className="text-lg font-bold text-gray-800">Code Sent!</p>
            <p className="text-gray-500 text-sm mt-2">Redirecting you to verify...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-rose-400 focus:bg-white transition-all font-medium shadow-sm"
                  placeholder="cupid@love.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100">
                {errorMsg}
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Code'}
              {!loading && <Send size={18} />}
            </motion.button>
          </form>
        )}
      </motion.div>
    </main>
  );
}
