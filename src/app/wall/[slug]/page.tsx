'use client';
import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { THEMES, STAMPS } from '@/lib/constants';
import { Wall, Message, WallTheme, StampType, ThemeConfig } from '@/types';
import { 
  Mail, Lock, Send, Copy, Sparkles, ArrowLeft, X, 
  Share2, Check, Music, CheckCircle2, Loader2, 
  AlertCircle, Calendar, User, QrCode, MessageSquareQuote 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingHearts from '@/components/FloatingHearts';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { encryptMessage, decryptMessage } from '@/lib/encryption';

export default function WallPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  // --- States ---
  const [wall, setWall] = useState<Wall | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [view, setView] = useState<'wall' | 'write'>('wall');
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false); 
  const [isOwner, setIsOwner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoID, setVideoID] = useState<string | null>(null);

  // 1. Fetch Wall Data
  useEffect(() => {
    async function loadWall() {
      const { data: wallData } = await supabase.from('walls').select('*').eq('slug', slug).single();
      if (wallData) {
        setWall(wallData);
        const now = new Date().getTime();
        const unlockDate = new Date(wallData.unlock_date).getTime();
        if (now >= unlockDate) {
          setIsUnlocked(true);
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === wallData.owner_id) setIsOwner(true);
        const { data: msgs } = await supabase.from('messages').select('*').eq('wall_id', wallData.id).order('created_at', { ascending: false });
        setMessages(msgs || []);
      }
      setLoading(false);
    }
    loadWall();
    const channel = supabase.channel(`wall-${slug}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      setMessages((prev) => [payload.new as Message, ...prev]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [slug]);

  // 2. Countdown Logic
  useEffect(() => {
    if (!wall || isUnlocked) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(wall.unlock_date).getTime();
      const distance = target - now;
      if (distance <= 0) {
        setIsUnlocked(true);
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [wall, isUnlocked]);

  // 3. Music Logic
  useEffect(() => {
    if (wall?.music_url) {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = wall.music_url.match(regex);
      if (match && match[1]) setVideoID(match[1]);
    }
  }, [wall]);

  const currentTheme = wall ? THEMES[wall.theme as WallTheme] : THEMES['soft-pink'];
  const canOpen = isUnlocked;
  const celebrationText = wall?.type === 'valentine' ? "Happy Valentine's Day! ❤️" : `Happy Graduation Day, ${wall?.name}! 🎓`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialInvite = async () => {
    const text = wall?.type === 'valentine' ? "Secret valentines! Locked till Feb 14, 2026! 🤫💌" : "Digital yearbook! Locked until graduation! 🎓✨";
    if (navigator.share) {
      try { await navigator.share({ title: `${wall?.name}'s Wall`, text, url: window.location.href }); } catch (err) {}
    } else { handleCopyLink(); alert("Link copied!"); }
  };

  const handleDownloadQR = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(window.location.href)}`;
    window.open(qrUrl, '_blank');
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-rose-500 animate-pulse text-xl">Opening mailbox...</div>;
  if (!wall) return <div className="h-screen flex flex-col items-center justify-center gap-4 font-bold text-gray-800">Wall not found!</div>;

  // ENTRY OVERLAY
  if (videoID && !hasEntered) {
    return (
      <main className="h-screen flex flex-col items-center justify-center p-8 text-center relative">
        <div className="bg-mesh" />
        <FloatingHearts color={currentTheme.heartColor}/>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 glass-card p-12 rounded-[48px] max-w-xs w-full border-white shadow-2xl">
          <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-spin-slow border border-white">
             <Music className="text-rose-500" size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">{wall.name}'s Space</h1>
          <p className="text-gray-500 mb-10 text-xs font-bold uppercase tracking-widest leading-relaxed">This experience contains<br/>background music</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setHasEntered(true); setIsPlaying(true); }} className={`w-full py-5 rounded-full text-white font-black text-xl shadow-2xl ${currentTheme.accent}`}>Enter & Play Vibe</motion.button>
        </motion.div>
      </main>
    );
  }

  return (
    <div className="min-h-screen font-sans overflow-x-hidden relative pb-20">
      <div className="bg-mesh" />
      <FloatingHearts color={currentTheme.heartColor} />
      
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col relative">
        <AnimatePresence>
          {isUnlocked && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className={`w-full py-4 text-center font-black text-white relative overflow-hidden shadow-inner ${wall.type === 'valentine' ? 'bg-rose-500' : wall.type === 'graduation' ? 'bg-amber-500' : 'bg-blue-500'}`}>
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="relative z-10 flex items-center justify-center gap-3 text-lg">{celebrationText}</motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {view === 'wall' ? (
          <>
            <header className="px-6 py-10 sticky top-0 z-20">
              <div className="glass-card rounded-[40px] p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tighter">{wall.name}'s Collection</h2>
                  <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                    {isUnlocked ? (
                      <p className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2 border border-green-100"><CheckCircle2 size={14} /> Vault Unlocked</p>
                    ) : timeLeft ? (
                      <div className="flex gap-2">
                        {[{ l: 'd', v: timeLeft.d }, { l: 'h', v: timeLeft.h }, { l: 'm', v: timeLeft.m }, { l: 's', v: timeLeft.s }].map((u) => (
                          <div key={u.l} className="flex flex-col items-center bg-white/40 backdrop-blur-md rounded-2xl px-3 py-1 border border-white/50 shadow-sm min-w-11.25">
                            <span className="text-sm font-black leading-none text-rose-600">{u.v}</span>
                            <span className="text-[8px] font-bold opacity-50 uppercase">{u.l}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="bg-white/40 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Mail size={12} /> {messages.length} Letters</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleCopyLink} className="p-4 glass-card rounded-3xl text-rose-500 shadow-lg">{copied ? <Check size={24} className="text-green-500" /> : <Copy size={24} />}</motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleSocialInvite} className="p-4 glass-card rounded-3xl text-rose-500 shadow-lg"><Share2 size={24} /></motion.button>
                  {isOwner && wall.type === 'graduation' && <motion.button whileTap={{ scale: 0.9 }} onClick={handleDownloadQR} className="p-4 glass-card rounded-3xl text-amber-600 shadow-lg"><QrCode size={24} /></motion.button>}
                </div>
              </div>
            </header>

            <AnimatePresence>
               {wall.type === 'graduation' && wall.custom_prompt && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-6 mb-10">
                   <div className="glass-card rounded-[40px] p-10 relative overflow-hidden border-amber-200/50 bg-amber-50/5 text-center">
                     <MessageSquareQuote className="absolute -right-8 -bottom-8 text-amber-500/10 rotate-12" size={160} />
                     <div className="relative z-10">
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] mb-4 block">Classmate Prompt</span>
                        <h2 className="text-3xl md:text-4xl font-serif italic text-gray-800 leading-tight tracking-tight">"{wall.custom_prompt}"</h2>
                     </div>
                   </div>
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="px-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 pb-40">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.button layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, rotate: msg.rotation }} whileHover={{ scale: 1.08, rotate: 0, zIndex: 10 }} key={msg.id} onClick={() => setActiveMessage(msg)} className="aspect-4/5 rounded-4xl glass-card relative flex flex-col items-center justify-center overflow-hidden transition-all duration-500 group shadow-xl">
                    <div className="absolute inset-2 bg-white/20 rounded-3xl border border-white/40 shadow-inner group-hover:bg-white/40 transition-colors" />
                    {canOpen ? <span className="text-5xl drop-shadow-2xl z-10">{STAMPS[msg.stamp as StampType].icon}</span> : <div className="z-10 flex flex-col items-center gap-3"><div className="w-14 h-14 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white shadow-sm"><Lock size={24} className="text-gray-600 opacity-60" /></div><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sealed</span></div>}
                    <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000" />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 w-full max-w-xs px-6">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setView('write')} className="w-full py-6 rounded-full shadow-2xl bg-gray-900 text-white font-black text-xl flex items-center justify-center gap-3 border-t border-white/20"><Send size={24} /> Write Note</motion.button>
            </div>
          </>
        ) : (
          <WriteView wallId={wall.id} theme={currentTheme} onCancel={() => setView('wall')} onSuccess={() => setView('wall')} />
        )}

        {videoID && hasEntered && (
          <div className="fixed bottom-32 right-6 z-40">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsPlaying(!isPlaying)} className={`w-14 h-14 rounded-full bg-white/60 backdrop-blur-md shadow-2xl flex items-center justify-center border border-white transition-all ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <div className="absolute inset-0 rounded-full border-4 border-rose-500/5 border-dashed" />
              {isPlaying ? <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" /> : <Sparkles size={20} className="text-rose-400" />}
            </motion.button>
            <div className="pointer-events-none fixed -top-40 -left-40 overflow-hidden opacity-0">
               {isPlaying && <iframe width="100" height="100" src={`https://www.youtube.com/embed/${videoID}?autoplay=1&mute=0&loop=1&playlist=${videoID}&controls=0`} allow="autoplay; encrypted-media" />}
            </div>
          </div>
        )}

        <AnimatePresence>
          {activeMessage && <MessageModal message={activeMessage} isUnlocked={canOpen} onClose={() => setActiveMessage(null)} theme={currentTheme} wall={wall} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function WriteView({ wallId, theme, onCancel, onSuccess }: { wallId: string; theme: ThemeConfig; onCancel: () => void; onSuccess: () => void }) {
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('');
  const [hint, setHint] = useState('');
  const [stamp, setStamp] = useState<StampType>('heart');
  const [sending, setSending] = useState(false);
  const [isSent, setIsSent] = useState(false); 
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);
  const [isHarmfulIntent, setIsHarmfulIntent] = useState(false);
  const router = useRouter();

 useEffect(() => {
    if (body.length < 5) {
      setIsHarmfulIntent(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSafety(true);
      try {
        const res = await fetch('/api/check-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: body })
        });
        const data = await res.json();
        
        // This will now catch the "HARMFUL" result from Gemini
        setIsHarmfulIntent(data.isHarmful);
      } catch (e) {
        console.error("AI check failed");
      } finally {
        setIsCheckingSafety(false);
      }
    }, 1000); 

    return () => clearTimeout(timer);
  }, [body]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isHarmfulIntent) { alert("Please use kind words! ❤️"); return; }
    setSending(true);
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      const encryptedBody = encryptMessage(body, wallId);
      const { error } = await supabase.from('messages').insert([{
        wall_id: wallId, body: encryptedBody, author: author || 'Anonymous', hint, stamp, rotation: Math.random() * 10 - 5,
        ip_address: ipData.ip, user_agent: navigator.userAgent
      }]);
      if (!error) { confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); setIsSent(true); }
      else { alert("Failed."); setSending(false); }
    } catch (err) { setSending(false); alert("Error."); }
  };

  if (isSent) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-white/10 backdrop-blur-3xl">
        <div className="max-w-sm w-full glass-card p-12 rounded-[48px] text-center border-white/50 shadow-2xl">
          <div className="w-20 h-20 bg-green-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-12 animate-bounce"><CheckCircle2 size={40} /></div>
          <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Letter Sealed</h2>
          <p className="text-gray-500 mb-10 font-medium">Safe inside the mailbox.</p>
          <div className="space-y-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push('/auth')} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg">Create My Own Wall</motion.button>
            <button onClick={onSuccess} className="text-xs font-black text-gray-400 uppercase tracking-widest">Back</button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-100 bg-white/20 backdrop-blur-3xl flex flex-col items-center overflow-y-auto pb-20">
      <div className="w-full max-w-3xl px-6 py-10 flex items-center justify-between">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onCancel} className="w-12 h-12 glass-card rounded-full flex items-center justify-center text-gray-500 shadow-lg"><X size={20} /></motion.button>
        <div className="text-center flex flex-col items-center"><span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-1">Confidential</span><h3 className="font-black text-2xl tracking-tighter text-gray-900">Write Secret Note</h3></div>
        <div className="w-12" />
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-3xl px-6 space-y-8">
        <div className="relative group">
          <div className={`w-full glass-card rounded-[48px] p-12 transition-all duration-500 shadow-2xl border-t-8 ${isHarmfulIntent ? 'border-red-500 bg-red-50/30' : 'border-white/60 bg-white/40'}`}>
            <textarea required maxLength={5000} placeholder="Type your secret message..." className="w-full h-112.5 bg-transparent border-none resize-none focus:ring-0 text-2xl font-serif italic text-gray-800 leading-relaxed" value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-black/5">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${isCheckingSafety ? 'bg-amber-400 animate-pulse' : isHarmfulIntent ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isCheckingSafety ? 'Analyzing Vibe...' : isHarmfulIntent ? 'Unkindness Detected' : 'Vibe: Safe'}</span>
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{body.length.toLocaleString()} / 5,000</div>
            </div>
          </div>
          <AnimatePresence>{isHarmfulIntent && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest">Be Kind ❤️</motion.div>}</AnimatePresence>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-[40px] p-8 space-y-6 shadow-xl">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Identity</label>
            <div className="space-y-4">
              <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input placeholder="From (Optional)" className="w-full pl-12 pr-4 py-5 bg-white/30 border border-white/50 rounded-2xl outline-none focus:bg-white/60 transition-all font-bold text-sm" value={author} onChange={(e)=>setAuthor(e.target.value)} /></div>
              <div className="relative"><Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input required placeholder="Guess who? (Hint)" className="w-full pl-12 pr-4 py-5 bg-white/30 border border-white/50 rounded-2xl outline-none focus:bg-white/60 transition-all font-bold text-sm" value={hint} onChange={(e)=>setHint(e.target.value)} /></div>
            </div>
          </div>
          <div className="glass-card rounded-[40px] p-8 space-y-6 shadow-xl flex flex-col items-center">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pick a Seal</label>
            <div className="flex flex-wrap justify-center gap-4">
              {(Object.keys(STAMPS) as StampType[]).map((s) => (
                <button key={s} type="button" onClick={() => setStamp(s)} className={`w-16 h-16 rounded-3xl border-2 transition-all flex items-center justify-center text-3xl ${stamp === s ? 'border-rose-500 bg-white scale-110 shadow-2xl' : 'border-white/50 bg-white/10 opacity-40 hover:opacity-100'}`}>{STAMPS[s].icon}</button>
              ))}
            </div>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={sending || isHarmfulIntent || isCheckingSafety} className="w-full py-8 rounded-[40px] text-white font-black text-3xl shadow-2xl bg-gray-900 hover:bg-black transition-all flex items-center justify-center gap-4 mb-10 disabled:opacity-50">{sending ? <Loader2 className="animate-spin" /> : <>Seal & Send <Send size={28} /></>}</motion.button>
      </form>
    </motion.div>
  );
}

function MessageModal({ message, isUnlocked, onClose, theme, wall }: { message: Message; isUnlocked: boolean; onClose: () => void; theme: ThemeConfig; wall: Wall }) {
  const displayBody = isUnlocked ? decryptMessage(message.body, wall.id) : '';
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg bg-white/80 backdrop-blur-2xl rounded-[48px] overflow-hidden shadow-2xl border border-white" onClick={e => e.stopPropagation()}>
        <div className={`h-40 ${theme.bg} flex items-center justify-center relative`}>
          <div className="text-7xl animate-bounce drop-shadow-2xl">{STAMPS[message.stamp as StampType].icon}</div>
          <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-white/20 rounded-full text-gray-600 hover:bg-white/40"><X size={24}/></button>
        </div>
        <div className="p-12 text-center">
          {isUnlocked ? (
            <div className="space-y-6 animate-in fade-in duration-700">
              <div className="space-y-3">
                <span className="text-rose-500 font-black text-[10px] uppercase tracking-[0.4em] block">A message from {message.author}</span>
                <div className="bg-rose-50/50 py-2 px-4 rounded-2xl border border-rose-100/50 w-fit mx-auto shadow-sm">
                  <p className="text-[11px] font-bold text-rose-400 italic tracking-tight">Hint: "{message.hint}"</p>
                </div>
              </div>
              <div className="max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar text-center">
                <p className="text-2xl md:text-3xl font-serif italic text-gray-700 leading-relaxed whitespace-pre-wrap px-2">"{displayBody}"</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 text-center">
              <div className="space-y-2 text-center"><h3 className="text-3xl font-black text-gray-900 tracking-tighter">It's Sealed Tight!</h3><p className="text-gray-500 text-sm font-medium">Unlocks Feb 14, 2026 at 10:00 AM.</p></div>
              <div className="bg-white/50 p-10 rounded-[40px] border border-white shadow-inner text-center"><p className="text-[10px] font-black text-rose-400 uppercase mb-4 tracking-[0.3em]">The Sender's Hint:</p><p className="text-xl md:text-2xl font-bold text-rose-700 italic tracking-tight">"{message.hint}"</p></div>
            </div>
          )}
        </div>
        <div className="p-8 bg-gray-50/50 border-t flex justify-center"><button onClick={onClose} className="text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]">Close Envelope</button></div>
      </motion.div>
    </div>
  );
}