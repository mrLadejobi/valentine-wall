'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/auth'), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center border border-white">
        {success ? (
          <div className="animate-in zoom-in-95">
            <CheckCircle2 size={60} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black">Password Updated!</h1>
            <p className="text-gray-500 mt-2">Taking you back to login...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <h1 className="text-3xl font-black">New Password</h1>
            <p className="text-gray-500">Enter a secure new password for your account.</p>
            <div className="relative text-left">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input 
                type="password" required minLength={6}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-rose-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
               />
            </div>
            <button disabled={loading} className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg">
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}