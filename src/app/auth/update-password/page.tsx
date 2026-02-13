'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Check, Loader2, PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingHearts from '@/components/FloatingHearts';

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const router = useRouter();

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else {
            // Password updated successfully. Redirect to dashboard.
            router.push('/dashboard');
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
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <PartyPopper size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        New Password
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium text-sm">
                        Almost there! Set a new password for your account.
                    </p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-rose-400 focus:bg-white transition-all font-medium shadow-sm"
                                placeholder="New secure password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
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
                        {loading ? <Loader2 className="animate-spin" /> : 'Set New Password'}
                        {!loading && <Check size={18} />}
                    </motion.button>
                </form>
            </motion.div>
        </main>
    );
}
