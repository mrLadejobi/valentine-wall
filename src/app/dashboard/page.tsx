'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wall, Message, StampType, Profile } from '@/types';
import { STAMPS } from '@/lib/constants';
import Link from 'next/link';
import { 
  Plus, Layout, ExternalLink, Trash2, LogOut, 
  Copy, Check, Calendar, Heart, MessageCircle, 
  Sparkles, Share2, Zap, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // For interactivity
import FloatingHearts from '@/components/FloatingHearts';

interface DashboardWall extends Wall {
  messages: Pick<Message, 'id' | 'stamp' | 'hint' | 'created_at'>[];
}

export default function Dashboard() {
  const [walls, setWalls] = useState<DashboardWall[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        const { data: wallsData } = await supabase
          .from('walls')
          .select('*, messages(id, stamp, hint, created_at)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
        
        const sortedWalls = (wallsData || []).map(wall => ({
          ...wall,
          messages: (wall.messages || []).sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ).slice(0, 3)
        }));

        setWalls(sortedWalls);
      }
      setLoading(false);
    }

    fetchDashboardData();

    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchDashboardData(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleShare = async (slug: string, type: string) => {
    const url = `${window.location.origin}/wall/${slug}`;
    const text = type === 'valentine' 
      ? "I'm collecting secret valentines! Leave me a message that stays locked until Feb 14th. 🤫💌"
      : "Leave me a secret birthday message! It stays locked until my big day. 🎂✨";

    if (navigator.share) {
      try { await navigator.share({ title: 'My Envelope Wall', text, url }); } 
      catch (err) { handleCopy(slug, slug); }
    } else {
      handleCopy(slug, slug);
    }
  };

  const handleCopy = (slug: string, id: string) => {
    const url = `${window.location.origin}/wall/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this wall forever?")) return;
    const { error } = await supabase.from('walls').delete().eq('id', id);
    if (!error) setWalls(walls.filter(w => w.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // ADDED: Calendar Logic for Dashboard
  const handleReminder = (wall: DashboardWall) => {
    const title = `❤️ Open My ${wall.type === 'valentine' ? 'Valentine' : 'Birthday'} Wall!`;
    const details = `Your secret envelopes are now unlocked! Check them here: ${window.location.origin}/wall/${wall.slug}`;
    const dateStr = wall.type === 'valentine' ? '20250214' : wall.unlock_date.split('T')[0].replace(/-/g, '');
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dateStr}T090000Z/${dateStr}T100000Z&details=${encodeURIComponent(details)}`;
    window.open(googleUrl, '_blank');
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-rose-500 animate-pulse text-xl">Loading your space...</div>;

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 relative overflow-x-hidden pb-20">
      <FloatingHearts color="text-rose-200" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-10">
          <div className="animate-in slide-in-from-left duration-700">
            <div className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Session</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
              Hi, {profile?.full_name?.split(' ')[0] || 'Celebrant'}! ✨
            </h1>
            <p className="text-gray-500 font-medium mt-2 flex items-center gap-2">
              <MessageCircle size={16} className="text-rose-400" /> 
              {walls.reduce((acc, w) => acc + w.messages.length, 0)} notes total
            </p>
          </div>
          
          <div className="flex gap-2">
             <motion.button 
               whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
               onClick={handleLogout} 
               className="p-3 text-gray-400 hover:text-rose-500 transition-colors bg-white rounded-2xl shadow-sm border border-gray-100"
             >
               <LogOut size={20} />
             </motion.button>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* CREATE NEW WALL BUTTON */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/create" className="group border-3 border-dashed border-rose-200 rounded-4xl p-8 flex flex-col items-center justify-center gap-4 hover:border-rose-400 hover:bg-white transition-all min-h-70 bg-rose-50/20 h-full">
              <div className="w-16 h-16 bg-white text-rose-500 rounded-2xl flex items-center justify-center shadow-sm ring-4 ring-rose-50">
                <Plus size={32} strokeWidth={3} />
              </div>
              <div className="text-center">
                <span className="block font-bold text-rose-600 text-lg">Create New Wall</span>
                <span className="text-xs text-rose-400 font-medium tracking-tight">Valentines or Birthdays</span>
              </div>
            </Link>
          </motion.div>

          {/* LIST OF WALLS */}
          <AnimatePresence>
            {walls.map((wall) => (
              <motion.div 
                layout key={wall.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-4xl p-8 shadow-sm border border-gray-100 flex flex-col group hover:shadow-2xl hover:shadow-rose-500/10 transition-all relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${wall.type === 'valentine' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                    {wall.type === 'valentine' ? <Heart size={28} className="fill-current" /> : <Calendar size={28} />}
                  </div>
                  <div className="flex gap-1">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleShare(wall.slug, wall.type)} className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-rose-500 transition-colors"><Share2 size={18} /></motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(wall.id)} className="p-2.5 hover:bg-rose-50 rounded-xl text-gray-400 hover:text-rose-500 transition-colors"><Trash2 size={18} /></motion.button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">{wall.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${wall.type === 'valentine' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                      {wall.type}
                    </span>
                    {/* ADDED: Remind Me Button */}
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleReminder(wall)}
                      className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 hover:text-rose-500 transition-colors uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md"
                    >
                      <Calendar size={10} /> Set Reminder
                    </motion.button>
                  </div>
                </div>

                {/* Activity Feed Section */}
                <div className={`rounded-3xl p-4 mb-6 border ${wall.type === 'valentine' ? 'bg-rose-50/50 border-rose-100' : 'bg-blue-50/50 border-blue-100'}`}>
                  <p className={`text-[10px] font-black uppercase mb-3 flex items-center gap-2 ${wall.type === 'valentine' ? 'text-rose-400' : 'text-blue-400'}`}>
                    <Zap size={12} fill="currentColor" /> Recent Activity
                  </p>
                  {wall.messages.length > 0 ? (
                    <div className="space-y-3">
                      {wall.messages.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                          <span className="text-xl bg-white p-1 rounded-lg shadow-sm border border-black/5">{STAMPS[m.stamp as StampType]?.icon || '💌'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-700 truncate italic">"{m.hint}"</p>
                            <p className="text-[9px] text-gray-400">{new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic py-2">No messages yet. Share your link!</p>
                  )}
                </div>
                
                <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                  <Link href={`/wall/${wall.slug}`} className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-rose-500 transition-colors group/link">
                    <Layout size={16} /> 
                    Open Wall 
                  </Link>
                  <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                    onClick={() => handleCopy(wall.slug, wall.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
                  >
                    {copiedId === wall.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {copiedId === wall.id ? 'Copied' : 'Copy Link'}
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