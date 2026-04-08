'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { THEMES, DEFAULT_VIBES } from '@/lib/constants';
import { WallTheme, WallType } from '@/types';
import { 
  ArrowLeft, Heart, CheckCircle2, Copy, 
  Sparkles, ExternalLink, LayoutDashboard, Music, 
  Calendar, User, PartyPopper, ChevronRight, ChevronLeft, Loader2,
  GraduationCap, MessageSquareQuote 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingHearts from '@/components/FloatingHearts';
import confetti from 'canvas-confetti';

// FEATURE FLAG: Set to true to show Graduation and Custom Music Links
const SHOW_ADVANCED_FEATURES = false;

export default function CreateWallPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<WallType>('valentine');
  const [unlockDate, setUnlockDate] = useState('2026-02-14'); 
  const [customPrompt, setCustomPrompt] = useState(''); 
  const [theme, setTheme] = useState<WallTheme>('soft-pink');
  const [musicUrl, setMusicUrl] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: activeUser } } = await supabase.auth.getUser();
      if (!activeUser) {
        router.replace('/auth?mode=login');
      } else {
        setUser(activeUser);
        setIsCheckingAuth(false);
      }
    };
    checkUser();
  }, [router]);

  const getID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleCreate = async () => {
    if (!user?.id) return;
    setLoading(true);
    const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const slug = `${cleanName}-${Math.random().toString(36).substring(2, 6)}`;

    const { error } = await supabase.from('walls').insert([{ 
      name: name.trim(), 
      theme, 
      slug, 
      type,
      custom_prompt: (SHOW_ADVANCED_FEATURES && type === 'graduation') ? customPrompt : null,
      unlock_date: `${unlockDate}T10:00:00`, 
      owner_id: user.id, 
      music_url: musicUrl,
    }]);

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      confetti({ 
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.6 },
        colors: type === 'graduation' ? ['#fbbf24', '#000000', '#ffffff'] : undefined
      });
      setSuccessSlug(slug);
    }
  };

  if (isCheckingAuth) {
    return (
      <main className="h-screen flex items-center justify-center bg-pink-50">
        <Loader2 className="animate-spin text-rose-500" size={40} />
      </main>
    );
  }

  if (successSlug) {
    return (
      <main className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
        <div className="bg-mesh" />
        <FloatingHearts color={THEMES[theme].heartColor} />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full glass-card rounded-[48px] p-10 text-center relative z-10 border border-white shadow-2xl">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-12"><CheckCircle2 size={40} /></div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter text-center">Wall Created!</h2>
          <p className="text-gray-500 mb-8 font-medium">Your secret mailbox is ready. Share your link!</p>
          <div className="space-y-4">
            <button onClick={() => { 
                const url = `${window.location.origin}/wall/${successSlug}`;
                navigator.clipboard.writeText(url); 
                setCopied(true); 
                setTimeout(()=>setCopied(false), 2000); 
              }} 
              className="w-full py-4 glass-card rounded-2xl flex items-center justify-between px-6 hover:bg-white/60 transition-all border-dashed border-2 border-rose-200"
            >
              <span className="text-xs font-bold text-gray-400 truncate mr-4 italic">.../wall/{successSlug}</span>
              {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} className="text-rose-500" />}
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => router.push(`/wall/${successSlug}`)} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xl shadow-xl">Go to Wall</motion.button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative flex flex-col lg:flex-row overflow-hidden">
      <div className="bg-mesh" />
      
      <div className="lg:w-1/2 p-6 lg:p-12 z-10 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <button onClick={() => router.push('/dashboard')} className="mb-8 text-gray-400 hover:text-gray-900 flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-colors">
            <ArrowLeft size={16} /> Dashboard
          </button>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">The Wall<br/>Identity</h1>
                <p className="text-gray-500 font-medium italic tracking-tight">Give your collection a beautiful name.</p>
                <div className="relative">
                   <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                   <input autoFocus className="w-full p-6 pl-14 glass-card rounded-3xl outline-none text-xl font-bold focus:bg-white transition-all shadow-xl" placeholder="e.g. Sarah's Space" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">The Occasion</h1>
                <p className="text-gray-500 font-medium italic">What are we celebrating?</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'valentine', icon: Heart, label: 'Valentine', color: 'text-rose-500' },
                    { id: 'birthday', icon: Calendar, label: 'Birthday', color: 'text-blue-500' },
                    // Conditional Graduation Button
                    ...(SHOW_ADVANCED_FEATURES ? [{ id: 'graduation', icon: GraduationCap, label: 'Graduation', color: 'text-amber-500' }] : [])
                  ].map((occ) => (
                    <button key={occ.id} type="button" onClick={() => {setType(occ.id as WallType); if(occ.id==='valentine') setUnlockDate('2026-02-14')}} className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${type === occ.id ? 'border-gray-900 bg-white shadow-xl scale-105' : 'border-transparent glass-card opacity-60'}`}>
                      <occ.icon className={type === occ.id ? occ.color : ''} />
                      <span className="font-bold text-xs">{occ.label}</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unlock Date</label>
                  <input type="date" className="w-full p-5 glass-card rounded-3xl outline-none text-lg font-bold transition-all focus:bg-white" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} />
                </div>
              </motion.div>
            )}

            {/* Conditionally hide Graduation Prompt Step */}
            {SHOW_ADVANCED_FEATURES && step === 3 && type === 'graduation' && (
              <motion.div key="step3-grad" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">The Yearbook<br/>Prompt</h1>
                <p className="text-gray-500 font-medium italic">Classmates will answer this question.</p>
                <div className="relative">
                   <MessageSquareQuote className="absolute left-5 top-6 text-amber-400" />
                   <textarea className="w-full p-6 pl-14 h-40 glass-card rounded-3xl outline-none text-xl font-bold focus:bg-white transition-all shadow-xl resize-none" placeholder="e.g. Where do you see me in 10 years?" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} />
                </div>
              </motion.div>
            )}

            {((step === 3 && type !== 'graduation') || step === 4) && (
              <motion.div key="step-vibe" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">Final Vibe</h1>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Music Vibe</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(DEFAULT_VIBES as any[]).map((vibe) => (
                      <button key={vibe.url} type="button" onClick={() => { setMusicUrl(vibe.url); setIsPreviewing(true); }} className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${musicUrl === vibe.url ? 'border-rose-500 bg-white shadow-md' : 'glass-card opacity-60'}`}>{vibe.label}</button>
                    ))}
                  </div>
                  
                  {/* Conditionally Hide Custom Music Input */}
                  {SHOW_ADVANCED_FEATURES && (
                    <input placeholder="Or paste YouTube link..." className="w-full p-4 glass-card rounded-2xl outline-none text-xs font-bold transition-all focus:bg-white" value={musicUrl} onChange={(e) => { setMusicUrl(e.target.value); if(getID(e.target.value)) setIsPreviewing(true); }} />
                  )}
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Color Palette</label>
                   <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(THEMES) as WallTheme[]).map((t) => (
                      <button key={t} type="button" onClick={() => setTheme(t)} className={`h-12 rounded-xl border-4 transition-all bg-linear-to-br ${theme === t ? 'border-gray-900 scale-110 shadow-lg' : 'border-white/50 shadow-inner'} ${THEMES[t].gradient}`} />
                    ))}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="p-5 glass-card rounded-full text-gray-400 hover:text-gray-900 active:scale-90"><ChevronLeft /></button>
            ) : <div />}
            
            {((type === 'graduation' && step < 4) || (type !== 'graduation' && step < 3)) ? (
              <button disabled={!name} onClick={() => setStep(step + 1)} className="px-12 py-5 bg-gray-900 text-white rounded-full font-black text-lg flex items-center gap-2 shadow-xl disabled:opacity-30">Next <ChevronRight size={20} /></button>
            ) : (
              <button onClick={handleCreate} disabled={loading} className={`px-12 py-5 text-white rounded-full font-black text-lg shadow-xl ${type==='graduation' ? 'bg-amber-500' : 'bg-rose-500'}`}>
                {loading ? <Loader2 className="animate-spin" /> : 'Launch Wall 🚀'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-white/10 backdrop-blur-md items-center justify-center p-12 border-l border-white/30 relative">
        <div className="w-full max-w-sm aspect-9/16 glass-card rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col p-8 scale-90">
           {/* Fixed Gradient Class */}
           <div className={`absolute inset-0 bg-linear-to-br opacity-40 ${THEMES[theme].gradient}`} />
           <FloatingHearts color={THEMES[theme].heartColor} />
           
           <div className="relative z-10 text-center mt-10">
              <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-white/50 text-gray-800">
                 {type === 'graduation' ? <GraduationCap size={32} /> : <Heart className="text-rose-500 fill-rose-500" size={32} />}
              </div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tighter">{name || "Your Wall"}</h3>
              <p className="text-[10px] font-black uppercase opacity-40 mt-1 tracking-widest leading-loose text-center">Unlocking<br/>{new Date(unlockDate).toLocaleDateString()}</p>
              
              {type === 'graduation' && customPrompt && SHOW_ADVANCED_FEATURES && (
                <div className="mt-4 p-4 bg-white/60 rounded-2xl border border-white/50 text-xs italic font-medium text-gray-600">
                  "{customPrompt}"
                </div>
              )}
           </div>

           <div className="mt-8 grid grid-cols-2 gap-3 opacity-20 flex-1 content-start text-center">
              {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-4/3 bg-gray-400/20 rounded-2xl border border-white/50 shadow-inner" />)}
           </div>
        </div>
      </div>

      {isPreviewing && getID(musicUrl) && (
        <iframe className="hidden" src={`https://www.youtube.com/embed/${getID(musicUrl)}?autoplay=1`} allow="autoplay" />
      )}
    </main>
  );
}