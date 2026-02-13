'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingHearts from '@/components/FloatingHearts';

export default function VerifyOtpPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const router = useRouter();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'recovery', // Important: 'recovery' is for password resets
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else {
            // Success! The user is now logged in.
            // Redirect to the update password page.
            router.push('/auth/update-password');
        }
    };

    return (
        <main className="min-h-screen bg-linear-to-br from-pink-50 to-rose-100 flex items-center justify-center p-6 relative overflow-hidden">
            <FloatingHearts />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl p-10 relative z-10 border border-white"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <KeyRound size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        Check your Email
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium text-sm">
                        We sent a code to <span className="font-bold text-gray-700">{email}</span>. Enter it below to verify.
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Verification Code</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-rose-400 focus:bg-white transition-all font-medium shadow-sm text-center tracking-[0.5em] text-xl"
                                placeholder="123456"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                maxLength={6}
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
                        {loading ? <Loader2 className="animate-spin" /> : 'Verify Code'}
                        {!loading && <ArrowRight size={18} />}
                    </motion.button>
                </form>
            </motion.div>
        </main>
    );
}
