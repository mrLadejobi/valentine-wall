'use client';
import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingHearts from '@/components/FloatingHearts';

export default function HomePage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      {/* Cinematic Background Layer */}
      <div className="bg-mesh" />
      <FloatingHearts color="text-rose-400" />
      
      <div className="z-10 max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Glass Header Icon */}
          <div className="w-24 h-24 glass-card rounded-4xl flex items-center justify-center mx-auto mb-10 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Heart className="text-rose-500 fill-rose-500" size={40} />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-6 tracking-tighter leading-[0.9]">
            Love<span className="text-rose-500">Wall</span>
          </h1>
          
          <p className="text-gray-600 text-lg md:text-xl font-medium mb-12 max-w-lg mx-auto leading-relaxed">
            The world's most beautiful digital mailbox for 
            <span className="text-rose-500"> Valentine's 2026</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth?mode=signup" className="px-10 py-5 bg-gray-900 text-white rounded-full font-black text-xl shadow-2xl flex items-center gap-3">
                Create My Wall <ArrowRight size={20} />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth?mode=login" className="px-10 py-5 glass-card text-gray-900 rounded-full font-black text-xl flex items-center gap-3">
                Login
              </Link>
            </motion.div>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 opacity-40 grayscale">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest"><Mail size={16}/> 10k+ Letters</div>
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest"><Sparkles size={16}/> 100% Secret</div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}