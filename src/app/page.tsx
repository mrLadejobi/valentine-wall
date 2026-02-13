'use client';
import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Mail } from 'lucide-react';
import FloatingHearts from '@/components/FloatingHearts';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-pink-50 to-rose-100 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      <FloatingHearts />
      
      <div className="z-10 max-w-md animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-rose-200/50 ring-4 ring-white/50 animate-bounce">
          <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
        </div>
        
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-rose-600 to-pink-500 mb-6 tracking-tight leading-tight">
          Valentine<br/>Envelope Wall
        </h1>
        
        <p className="text-gray-600 mb-10 text-lg leading-relaxed">
          Create your digital mailbox, share your unique link, and collect sealed letters from friends. 
          <span className="block mt-2 font-semibold text-rose-500 underline decoration-rose-200 underline-offset-4">
            Everything unlocks February 14th.
          </span>
        </p>

        <Link href="/auth" className="group relative inline-block w-full">
          <div className="absolute -inset-1 bg-linear-to-r from-pink-600 to-rose-600 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-300"></div>
          <div className="relative rounded-2xl px-8 py-5 bg-rose-500 text-white font-bold text-xl shadow-xl flex items-center justify-center gap-3 transform group-hover:-translate-y-1 transition-all active:scale-95">
            <Sparkles size={24} className="text-rose-200" />
            Start My Wall
          </div>
        </Link>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-rose-400 text-sm font-medium">
          <Mail size={16} />
          <span>Over 10,000 letters sent worldwide</span>
        </div>
      </div>
    </main>
  );
}