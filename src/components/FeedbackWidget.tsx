'use client';
import React, { useState } from 'react';
import { MessageSquare, X, Send, Smile, Meh, Frown, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();

      const { error } = await supabase.from('feedback').insert([{
        content,
        rating,
        user_id: userData.user?.id || null,
        page_url: window.location.pathname,
        ip_address: ipData.ip
      }]);

      if (!error) {
        setSent(true);
        setTimeout(() => {
          setSent(false);
          setIsOpen(false);
          setContent('');
          setRating(null);
        }, 3000);
      }
    } catch (err) {
      alert("Error sending feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-100">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-72 bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden"
          >
            {sent ? (
              <div className="p-8 text-center animate-in zoom-in-95">
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                <p className="font-bold text-gray-900">Thank you!</p>
                <p className="text-xs text-gray-500 mt-1">Your feedback helps us grow.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-sm uppercase tracking-widest text-rose-500">Send Feedback</h3>
                  <button type="button" onClick={() => setIsOpen(false)}><X size={18} className="text-gray-400" /></button>
                </div>

                <div className="flex justify-around mb-4 bg-rose-50 p-2 rounded-2xl">
                  {[
                    { id: 'sad', icon: Frown },
                    { id: 'neutral', icon: Meh },
                    { id: 'happy', icon: Smile },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRating(item.id)}
                      className={`p-2 rounded-xl transition-all ${rating === item.id ? 'bg-white shadow-sm text-rose-500 scale-110' : 'text-gray-400'}`}
                    >
                      <item.icon size={24} />
                    </button>
                  ))}
                </div>

                <textarea
                  required
                  placeholder="What's on your mind? Found a bug? Have an idea?"
                  className="w-full h-32 p-4 bg-gray-50 rounded-2xl border-none text-sm focus:ring-2 focus:ring-rose-200 resize-none mb-4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={16} /> Send Note</>}
                </motion.button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white border border-rose-100 rounded-full shadow-xl flex items-center justify-center text-rose-500 transition-shadow hover:shadow-rose-200/50"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
}