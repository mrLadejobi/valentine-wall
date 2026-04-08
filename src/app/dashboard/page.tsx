'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wall, Message, StampType, Profile } from '@/types';
import { STAMPS } from '@/lib/constants';
import Link from 'next/link';
import { 
  Plus, Layout, ExternalLink, Trash2, LogOut, 
  Copy, Check, Calendar, Heart, MessageCircle, 
  Sparkles, Share2, Zap, User, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingHearts from '@/components/FloatingHearts';

const SHOW_ADVANCED_FEATURES = false;

interface DashboardWall extends Wall {
  messages: Pick<Message, 'id' | 'stamp' | 'hint' | 'created_at'>[];
}

export default function Dashboard() {
  const [walls, setWalls] = useState<DashboardWall[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [totalNotes, setTotalNotes] = useState(0); 

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) setProfile(profileData);

        const { data: wallsData } = await supabase.from('walls').select('*, messages(id, stamp, hint, created_at)').eq('owner_id', user.id).order('created_at', { ascending: false });
        
        if (wallsData) {
          const actualTotal = wallsData.reduce((acc, wall) => acc + (wall.messages?.length || 0), 0);
          setTotalNotes(actualTotal);

          const sortedWalls = wallsData.map(wall => ({
            ...wall,
            messages: (wall.messages || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3)
          }));
          setWalls(sortedWalls);
        }
      }
      setLoading(false);
    }
    fetchDashboardData();

    const channel = supabase.channel('dashboard-updates').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchDashboardData).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleShare = async (slug: string, type: string) => {
    // ... logic remains the same
  };

  const handleCopy = (slug: string, id: string) => {
    // ... logic remains the same
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete wall forever?")) return;
    const { error } = await supabase.from('walls').delete().eq('id', id);
    if (!error) setWalls(walls.filter(w => w.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-rose-500 animate-pulse text-xl">Loading your space...</div>;

  return (
    <main className="min-h-screen p-6 relative overflow-x-hidden pb-20">
      <div className="bg-mesh" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-10">
          <div className="animate-in slide-in-from-left duration-700">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
              Hi, {profile?.full_name?.split(' ')[0] || 'Celebrant'}!
            </h1>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} className="p-3 text-gray-400 hover:text-rose-500 transition-colors glass-card rounded-2xl">
            <LogOut size={20} />
          </motion.button>
        </header>

        {/* --- BENTO BOX GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Create New Wall CTA (Large) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-8 glass-card rounded-[40px] p-10 flex flex-col justify-between min-h-80 bg-rose-50/20 hover:bg-white transition-colors"
          >
            <div>
              <div className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center mb-4 text-rose-500 ring-4 ring-rose-50">
                <Sparkles size={32} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 leading-tight tracking-tighter">Your Digital Celebration Hub</h2>
              <p className="text-gray-500 font-medium mt-2 max-w-md">Create a wall for any occasion—Valentines, Birthdays, Graduations, and more.</p>
            </div>
            <Link href="/create" className="mt-8 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold inline-flex items-center gap-2 shadow-xl hover:bg-black transition-all">
              <Plus size={20} /> Create New Wall
            </Link>
          </motion.div>

          {/* Stats Tile */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-4 glass-card rounded-[40px] p-10 flex flex-col items-center justify-center text-center bg-blue-50/20"
          >
            <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mb-4 text-blue-500">
              <MessageCircle size={32} />
            </div>
            <span className="text-6xl font-black text-gray-900 tracking-tighter">{totalNotes}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Notes Collected</span>
          </motion.div>

          {/* Existing Walls */}
          <AnimatePresence>
            {walls.map((wall, index) => (
              <motion.div 
                layout 
                key={wall.id}
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 + index * 0.1 } }}
                className="lg:col-span-6 glass-card rounded-[40px] p-8 flex flex-col group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${wall.type === 'valentine' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                    {wall.type === 'valentine' ? <Heart size={28} className="fill-current" /> : <Calendar size={28} />}
                  </div>
                  <div className="flex gap-1">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleShare(wall.slug, wall.type)} className="p-2.5 hover:bg-white/50 rounded-xl text-gray-400"><Share2 size={18} /></motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(wall.id)} className="p-2.5 hover:bg-white/50 rounded-xl text-gray-400"><Trash2 size={18} /></motion.button>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-1 leading-tight tracking-tighter">{wall.name}</h3>
                
                <div className={`rounded-full p-2 mb-6 border ${wall.type === 'valentine' ? 'bg-rose-50/50 border-rose-100' : 'bg-blue-50/50 border-blue-100'}`}>
                  <p className={`text-[10px] font-black uppercase text-center ${wall.type === 'valentine' ? 'text-rose-400' : 'text-blue-400'}`}>
                    {wall.messages.length > 0 ? `${wall.messages.length} New Messages` : 'Waiting for messages...'}
                  </p>
                </div>
                
                <div className="mt-auto pt-6 border-t border-white/50 flex justify-between items-center">
                  <Link href={`/wall/${wall.slug}`} className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-rose-500 group/link">
                    <Layout size={16} /> Open Wall 
                  </Link>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => handleCopy(wall.slug, wall.id)} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold">
                    {copiedId === wall.id ? <Check size={14} /> : <Copy size={14} />}
                    {copiedId === wall.id ? 'Copied' : 'Copy'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}