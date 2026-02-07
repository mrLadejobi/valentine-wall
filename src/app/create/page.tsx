'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { THEMES, DEFAULT_VIBES } from '@/lib/constants';
import { WallTheme, WallType } from '@/types';
import { ArrowLeft, Heart, CheckCircle2, Copy, Share2, Sparkles, ExternalLink, LayoutDashboard, Music, Calendar } from 'lucide-react';
import FloatingHearts from '@/components/FloatingHearts';
import confetti from 'canvas-confetti';

export default function CreateWallPage() {
  const [name, setName] = useState('');
  const [type, setType] = useState<WallType>('valentine');
  const [unlockDate, setUnlockDate] = useState('2026-02-14'); 
  const [theme, setTheme] = useState<WallTheme>('soft-pink');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Music States
  const [musicUrl, setMusicUrl] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);

  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: activeUser } } = await supabase.auth.getUser();
      if (!activeUser) { router.push('/auth'); } 
      else { setUser(activeUser); }
    };
    checkUser();
  }, [router]);

  const getID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setLoading(true);

    const cleanName = name.toLowerCase().trim().replace(/[']/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const slug = `${cleanName}-${Math.random().toString(36).substring(2, 6)}`;

    const { error } = await supabase.from('walls').insert([{ 
      name: name.trim(), theme, slug, type,
      unlock_date: new Date(unlockDate).toISOString(),
      owner_id: user.id, music_url: musicUrl,
    }]);

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setSuccessSlug(slug);
      setLoading(false);
    }
  };

  if (!user) return <div className="h-screen flex items-center justify-center font-bold text-rose-500 animate-pulse">Checking credentials...</div>;

  if (successSlug) {
    return (
      <main className={`min-h-screen ${THEMES[theme].bg} flex items-center justify-center p-6 relative overflow-hidden`}>
        <FloatingHearts color={THEMES[theme].heartColor} />
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl text-center relative z-10 border border-white">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={48} /></div>
          <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Wall Created!</h2>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 truncate mr-4">{window.location.origin}/wall/{successSlug}</span>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/wall/${successSlug}`); setCopied(true); setTimeout(()=>setCopied(false), 2000); }} className="p-2 text-rose-500">{copied ? <Sparkles size={20} /> : <Copy size={20} />}</button>
          </div>
          <div className="space-y-3">
            <button onClick={() => window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('❤️ Open My Wall!')}&dates=20260214T090000Z/20260214T100000Z`, '_blank')} className="w-full bg-rose-50 text-rose-500 py-4 rounded-2xl font-bold text-sm border border-rose-100 flex items-center justify-center gap-2"><Calendar size={18} /> Remind me in 2026</button>
            <button onClick={() => router.push(`/wall/${successSlug}`)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold">View Wall</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen transition-all duration-500 ${THEMES[theme].bg} p-6 relative overflow-x-hidden pb-24`}>
      <FloatingHearts color={THEMES[theme].heartColor} />
      <div className="max-w-md mx-auto relative z-10">
        <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2 text-gray-500 mb-6"><ArrowLeft size={28} /></button>
        <h2 className="text-4xl font-black text-gray-900 mb-8 tracking-tight leading-tight">Design your wall</h2>
        
        <form onSubmit={handleCreate} className="space-y-8">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Wall Display Name</label>
            <input required maxLength={20} className={`w-full p-5 bg-white/70 backdrop-blur-md rounded-2xl border-2 border-transparent outline-none text-lg font-medium transition-all ${type === 'valentine' ? 'focus:border-rose-400' : 'focus:border-blue-400'}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Secret Collection" />
          </div>

          {/* Occasion */}
          <div className="space-y-2">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Occasion</label>
             <div className="flex bg-gray-100 p-1 rounded-2xl">
                <button type="button" onClick={() => {setType('valentine'); setUnlockDate('2026-02-14');}} className={`flex-1 py-3 rounded-xl font-bold transition-all ${type === 'valentine' ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-500'}`}>Valentine</button>
                <button type="button" onClick={() => setType('birthday')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${type === 'birthday' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-500'}`}>Birthday</button>
              </div>
          </div>

          {type === 'birthday' && (
            <div className="animate-in slide-in-from-top-4 duration-300">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Birthday Date</label>
               <input type="date" required className="w-full p-4 bg-white/70 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-400 font-medium" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} />
            </div>
          )}

          {/* BRINGING BACK THE MUSIC URL SPACE */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <Music size={14} /> Set the Vibe (Music)
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {(DEFAULT_VIBES as any[]).map((vibe) => (
                <button key={vibe.url} type="button" onClick={() => { setMusicUrl(vibe.url); setIsPreviewing(true); }} className={`text-xs p-3 rounded-xl border-2 font-bold transition-all ${musicUrl === vibe.url ? (type === 'valentine' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-blue-500 bg-blue-50 text-blue-600') : 'border-gray-100 bg-white/30 text-gray-400'}`}>{vibe.label}</button>
              ))}
            </div>
            
            {/* The Custom Link Space */}
            <div className="relative group">
               <input 
                 placeholder="Paste a YouTube Link for a song here..." 
                 className={`w-full p-4 bg-white/70 backdrop-blur-md rounded-2xl border-2 border-transparent outline-none transition-all text-sm font-medium ${type === 'valentine' ? 'focus:border-rose-400' : 'focus:border-blue-400'}`} 
                 value={musicUrl} 
                 onChange={(e) => {
                    setMusicUrl(e.target.value);
                    if(getID(e.target.value)) setIsPreviewing(true);
                 }} 
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                  <Sparkles size={16} className={type === 'valentine' ? 'text-rose-400' : 'text-blue-400'} />
               </div>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="space-y-3 pb-10">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Visual Theme</label>
            <div className="grid gap-3">
              {(Object.keys(THEMES) as WallTheme[]).map((t) => (
                <button key={t} type="button" onClick={() => setTheme(t)} className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${theme === t ? (type === 'valentine' ? 'border-rose-500 bg-white shadow-md' : 'border-blue-500 bg-white shadow-md') : 'border-white/50 bg-white/30'}`}>
                   <span className="capitalize font-bold text-gray-700">{t.replace('-', ' ')}</span>
                   {theme === t && <CheckCircle2 className={type === 'valentine' ? 'text-rose-500' : 'text-blue-500'} size={20} />}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || !name} className={`w-full text-white p-5 rounded-3xl font-black text-xl shadow-xl transition-all active:scale-95 disabled:opacity-50 mb-10 ${type === 'valentine' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? 'Creating space...' : 'Create My Wall'}
          </button>
        </form>
      </div>

      {/* Hidden Preview Player Overlay */}
      {isPreviewing && getID(musicUrl) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-4 rounded-full shadow-2xl border border-rose-100 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-10">
          <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
          <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Vibe Preview</span>
          <button onClick={() => setIsPreviewing(false)} className="text-[9px] font-black bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors uppercase tracking-tighter">Stop</button>
          <iframe className="hidden" src={`https://www.youtube.com/embed/${getID(musicUrl)}?autoplay=1`} allow="autoplay" />
        </div>
      )}
    </main>
  );
}