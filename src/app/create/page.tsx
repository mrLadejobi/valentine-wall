'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { THEMES, DEFAULT_VIBES } from '@/lib/constants';
import { WallTheme, WallType } from '@/types';
import { ArrowLeft, Heart, CheckCircle2, Copy, Share2, Sparkles, ExternalLink, LayoutDashboard, Music } from 'lucide-react';
import FloatingHearts from '@/components/FloatingHearts';
import confetti from 'canvas-confetti';

export default function CreateWallPage() {
  const [name, setName] = useState('');
  const [type, setType] = useState<WallType>('valentine');
  const [unlockDate, setUnlockDate] = useState('2026-02-14');
  const [theme, setTheme] = useState<WallTheme>('soft-pink');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [musicUrl, setMusicUrl] = useState('');
  
  // New States for Preview
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: activeUser } } = await supabase.auth.getUser();
      if (!activeUser) {
        router.push('/auth');
      } else {
        setUser(activeUser);
      }
    };
    checkUser();
  }, [router]);

  // Helper to extract YouTube ID
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
    const randomId = Math.random().toString(36).substring(2, 6);
    const slug = `${cleanName}-${randomId}`;

    const { error } = await supabase
      .from('walls')
      .insert([{ 
        name: name.trim(), theme, slug, type,
        unlock_date: new Date(unlockDate).toISOString(),
        owner_id: user.id, music_url: musicUrl,
      }]);

    if (error) {
      alert("Database Error: " + error.message);
      setLoading(false);
    } else {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setSuccessSlug(slug);
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/wall/${successSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const url = `${window.location.origin}/wall/${successSlug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name}'s Wall`,
          text: `Leave me a secret message! Locked until ${new Date(unlockDate).toLocaleDateString()}.`,
          url: url,
        });
      } catch (err) { console.log(err); }
    } else {
      handleCopyLink();
    }
  };

  if (!user) return <div className="h-screen flex items-center justify-center font-bold text-rose-500">Checking credentials...</div>;

  if (successSlug) {
    return (
      <main className={`min-h-screen ${THEMES[theme].bg} flex items-center justify-center p-6 relative overflow-hidden`}>
        <FloatingHearts />
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl text-center relative z-10 border border-white">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Wall Created!</h2>
          <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400 truncate mr-4">{window.location.origin}/wall/{successSlug}</span>
            <button onClick={handleCopyLink} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">{copied ? <Sparkles size={20} /> : <Copy size={20} />}</button>
          </div>
          <div className="space-y-3">
            <button onClick={handleNativeShare} className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2">
              <Share2 size={20} /> Share Wall Link
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => router.push(`/wall/${successSlug}`)} className="bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                <ExternalLink size={18} /> View Wall
              </button>
              <button onClick={() => router.push('/dashboard')} className="bg-white border-2 border-gray-100 text-gray-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                <LayoutDashboard size={18} /> Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen transition-all duration-500 ${THEMES[theme].bg} p-6 relative overflow-x-hidden pb-24`}>
      <FloatingHearts />
      <div className="max-w-md mx-auto relative z-10">
        <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2 text-gray-500 mb-6"><ArrowLeft size={28} /></button>
        <div className="mb-8">
          <h2 className="text-4xl font-black text-gray-900 mb-2">Design your wall</h2>
          <p className="text-gray-500 font-medium">Welcome, {user.email?.split('@')[0]}! Let's build your vibe.</p>
        </div>
        
        <form onSubmit={handleCreate} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Your Display Name</label>
            <input required maxLength={20} className={`w-full p-5 bg-white/70 backdrop-blur-md rounded-2xl border-2 border-transparent focus:bg-white transition-all shadow-sm outline-none text-lg font-medium ${type === 'valentine' ? 'focus:border-rose-400' : 'focus:border-blue-400'}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Secret Mailbox" />
          </div>

          <div className="space-y-3">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">What's the occasion?</label>
             <div className="flex bg-gray-200/50 backdrop-blur-sm p-1 rounded-2xl">
                <button type="button" onClick={() => {setType('valentine'); setUnlockDate('2026-02-14');}} className={`flex-1 py-3 rounded-xl font-bold transition-all ${type === 'valentine' ? 'bg-white shadow-sm text-rose-500' : 'text-gray-500'}`}>Valentine</button>
                <button type="button" onClick={() => setType('birthday')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${type === 'birthday' ? 'bg-white shadow-sm text-blue-500' : 'text-gray-500'}`}>Birthday</button>
              </div>
          </div>

          {type === 'birthday' && (
            <div className="space-y-2 animate-in slide-in-from-top-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">When is the Birthday?</label>
              <input type="date" required className="w-full p-4 bg-white/70 backdrop-blur-md border-2 border-transparent rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all font-medium" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} />
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Music size={14} /> Set the Vibe (Music)</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {(DEFAULT_VIBES as any[]).map((vibe) => (
                <button key={vibe.url} type="button" onClick={() => { setMusicUrl(vibe.url); setIsPreviewing(true); }} className={`text-xs p-3 rounded-xl border-2 font-bold transition-all ${musicUrl === vibe.url ? (type === 'valentine' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-blue-500 bg-blue-50 text-blue-600') : 'border-gray-100/50 bg-white/30 text-gray-400 hover:bg-white/50'}`}>
                  {vibe.label}
                </button>
              ))}
            </div>
            <input placeholder="Or paste a YouTube Link..." className={`w-full p-4 bg-white/70 backdrop-blur-md border-2 border-transparent rounded-2xl outline-none focus:bg-white transition-all text-sm font-medium ${type === 'valentine' ? 'focus:border-rose-400' : 'focus:border-blue-400'}`} value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select a Theme</label>
            <div className="grid gap-3">
              {(Object.keys(THEMES) as WallTheme[]).map((t) => (
                <button key={t} type="button" onClick={() => setTheme(t)} className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all group ${theme === t ? (type === 'valentine' ? 'border-rose-500 bg-white shadow-md ring-4 ring-rose-50' : 'border-blue-500 bg-white shadow-md ring-4 ring-blue-50') : 'border-white/50 bg-white/30 hover:bg-white/50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-linear-to-br ${THEMES[t].gradient} shadow-inner flex items-center justify-center text-white`}>{theme === t && <Heart size={18} className="fill-current" />}</div>
                    <span className={`capitalize font-bold text-lg ${theme === t ? 'text-gray-900' : 'text-gray-600'}`}>{t.replace('-', ' ')}</span>
                  </div>
                  {theme === t && <CheckCircle2 className={type === 'valentine' ? "text-rose-500" : "text-blue-500"} size={24} />}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || !name} className={`w-full text-white p-5 rounded-2xl font-bold text-xl shadow-xl transition-all transform active:scale-95 disabled:opacity-50 mb-10 ${type === 'valentine' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{loading ? 'Creating space...' : 'Create Wall'}</button>
        </form>
      </div>

      {/* Hidden Preview Player Overlay */}
      {isPreviewing && getID(musicUrl) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-rose-100 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-10">
          <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Previewing...</span>
          <button onClick={() => setIsPreviewing(false)} className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded-md">STOP</button>
          <iframe className="hidden" src={`https://www.youtube.com/embed/${getID(musicUrl)}?autoplay=1`} allow="autoplay" />
        </div>
      )}
    </main>
  );
}