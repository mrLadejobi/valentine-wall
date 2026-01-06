'use client';
import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { THEMES, STAMPS } from '@/lib/constants';
import { Wall, Message, WallTheme, StampType, ThemeConfig } from '@/types';
import { Mail, Lock, Send, Copy, Sparkles, ArrowLeft, X, Share2, Check, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingHearts from '@/components/FloatingHearts';
import confetti from 'canvas-confetti';

export default function WallPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  // States
  const [wall, setWall] = useState<Wall | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [view, setView] = useState<'wall' | 'write'>('wall');
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false); 
  const [isValentinesDay, setIsValentinesDay] = useState(false); 
  const [isOwner, setIsOwner] = useState(false);
  const [copied, setCopied] = useState(false);

  // Music & Entry States
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoID, setVideoID] = useState<string | null>(null);

  useEffect(() => {
    async function loadWall() {
      const { data: wallData } = await supabase.from('walls').select('*').eq('slug', slug).single();
      if (wallData) {
        setWall(wallData);
        const today = new Date();
        const unlockDate = new Date(wallData.unlock_date);
        if (today >= unlockDate) setIsUnlocked(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === wallData.owner_id) setIsOwner(true);

        const { data: msgs } = await supabase.from('messages').select('*').eq('wall_id', wallData.id).order('created_at', { ascending: false });
        setMessages(msgs || []);
      }
      setLoading(false);
    }
    loadWall();

    const channel = supabase.channel('realtime-wall').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      if (wall && payload.new.wall_id === wall.id) setMessages((prev) => [payload.new as Message, ...prev]);
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [slug, wall?.id]);

  useEffect(() => {
    if (wall?.music_url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = wall.music_url.match(regExp);
      if (match && match[2].length === 11) setVideoID(match[2]);
    }
  }, [wall]);

  const currentTheme = wall ? THEMES[wall.theme as WallTheme] : THEMES['soft-pink'];
  const canOpen = isUnlocked || isValentinesDay;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialInvite = async () => {
    const text = wall?.type === 'valentine' ? "Secret valentine collection! Leave a note locked till Feb 14th! 🤫" : "Secret birthday notes! Locked until the big day! 🎂";
    if (navigator.share) {
      try { await navigator.share({ title: `${wall?.name}'s Wall`, text, url: window.location.href }); } catch (err) {}
    } else { handleCopyLink(); alert("Link copied!"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-rose-500 animate-pulse">Loading...</div>;
  if (!wall) return <div className="h-screen flex flex-col items-center justify-center gap-4 font-bold">Wall not found!</div>;

  // ENTRY OVERLAY (The Magic Autoplay Fix)
  if (videoID && !hasEntered) {
    return (
      <main className={`h-screen flex flex-col items-center justify-center bg-linear-to-br ${currentTheme.gradient} p-8 text-center`}>
        <FloatingHearts />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-spin-slow">
             <Music className="text-rose-500" size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">{wall.name}'s Space</h1>
          <p className="text-gray-500 mb-10 font-medium">Click enter to start the experience.</p>
          <button onClick={() => { setHasEntered(true); setIsPlaying(true); }} className={`px-12 py-5 rounded-full text-white font-black text-xl shadow-2xl transition-all active:scale-95 ${currentTheme.accent}`}>
            Enter & Play Vibe
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-700 bg-linear-to-br ${currentTheme.gradient} font-sans overflow-x-hidden`}>
      <FloatingHearts />
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative shadow-2xl bg-white/10 backdrop-blur-sm border-x border-white/20">
        {view === 'wall' ? (
          <>
            <header className={`px-6 py-8 ${currentTheme.card} border-b border-white/20 sticky top-0 z-20`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className={`text-3xl font-black ${currentTheme.text}`}>{wall.name}'s Wall</h2>
                  <p className="text-[10px] font-bold opacity-50 uppercase mt-2">{wall.type === 'valentine' ? "Unlocks Feb 14th" : `Unlocks ${new Date(wall.unlock_date).toLocaleDateString()}`}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCopyLink} className="p-3 bg-white rounded-2xl shadow-sm border border-rose-100 text-rose-500">{copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}</button>
                  {isOwner && <button onClick={handleSocialInvite} className="flex items-center gap-2 px-4 py-3 bg-rose-500 text-white rounded-2xl shadow-md font-bold text-sm"><Share2 size={18} /><span>Invite</span></button>}
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 pb-32 scrollbar-hide">
              <div className="grid grid-cols-2 gap-4">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.button layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, rotate: msg.rotation }} key={msg.id} onClick={() => setActiveMessage(msg)} className={`aspect-4/3 rounded-xl ${currentTheme.envelope} shadow-lg relative flex items-center justify-center`}>
                      {canOpen ? <span className="text-4xl">{STAMPS[msg.stamp as StampType].icon}</span> : <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center"><Lock size={18} className="opacity-40" /></div>}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-6">
              <button onClick={() => setView('write')} className={`w-full rounded-full py-5 shadow-2xl ${currentTheme.accent} text-white font-black text-xl flex items-center justify-center gap-3`}><Send size={24} /> Write Letter</button>
            </div>

            {isOwner && (
              <div className="mt-auto p-4 bg-white/40 backdrop-blur-md text-[10px] flex justify-between items-center z-40 border-t border-white/20">
                <span className="font-bold opacity-50 uppercase">Owner Tools: Force Unlock</span>
                <input type="checkbox" checked={isValentinesDay} onChange={(e) => setIsValentinesDay(e.target.checked)} className="w-4 h-4 rounded text-rose-500" />
              </div>
            )}
          </>
        ) : (
          <WriteView wallId={wall.id} theme={currentTheme} onCancel={() => setView('wall')} onSuccess={() => setView('wall')} />
        )}

        {videoID && (
          <div className="fixed bottom-32 right-6 z-40">
            <button onClick={() => setIsPlaying(!isPlaying)} className={`w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-rose-100 transition-all ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <div className="absolute inset-0 rounded-full border-4 border-black/5 border-dashed" />
              {isPlaying ? <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" /> : <Sparkles size={20} className="text-rose-300" />}
            </button>
            {isPlaying && <iframe className="hidden" src={`https://www.youtube.com/embed/${videoID}?autoplay=1&loop=1&playlist=${videoID}`} allow="autoplay" />}
          </div>
        )}

        <AnimatePresence>
          {activeMessage && <MessageModal message={activeMessage} isUnlocked={canOpen} onClose={() => setActiveMessage(null)} theme={currentTheme} wall={wall} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS (Keep outside the main WallPage function) ---

function WriteView({ wallId, theme, onCancel, onSuccess }: { wallId: string; theme: ThemeConfig; onCancel: () => void; onSuccess: () => void }) {
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('');
  const [hint, setHint] = useState('');
  const [stamp, setStamp] = useState<StampType>('heart');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from('messages').insert([{
      wall_id: wallId,
      body,
      author: author || 'Anonymous',
      hint,
      stamp,
      rotation: Math.random() * 10 - 5
    }]);

    if (!error) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      onSuccess();
    } else {
      alert("Failed to send letter.");
      setSending(false);
    }
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="flex-1 flex flex-col bg-gray-50 z-50 overflow-y-auto">
      <div className="p-4 flex items-center gap-4 bg-white border-b sticky top-0 z-10">
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft /></button>
        <h3 className="font-black text-xl">Write a Secret Note</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-8 border-rose-400">
          <textarea required maxLength={500} placeholder="Write your secret message..." className="w-full h-48 border-none resize-none focus:ring-0 text-lg font-serif italic" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {(Object.keys(STAMPS) as StampType[]).map((s) => (
              <button key={s} type="button" onClick={() => setStamp(s)} className={`text-3xl p-3 rounded-xl border-2 transition-all ${stamp === s ? 'border-rose-500 bg-rose-50 scale-110' : 'border-gray-100 opacity-50'}`}>{STAMPS[s].icon}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
             <input placeholder="From (Optional)" className="w-full p-4 bg-gray-50 rounded-xl border" value={author} onChange={(e)=>setAuthor(e.target.value)} />
             <input required placeholder="Hint (Guess who?)" className="w-full p-4 bg-gray-50 rounded-xl border" value={hint} onChange={(e)=>setHint(e.target.value)} />
          </div>
        </div>
        <button disabled={sending} className={`w-full py-5 rounded-2xl text-white font-black text-xl shadow-lg ${theme.accent}`}>
          {sending ? "Sealing..." : "Send Letter"}
        </button>
      </form>
    </motion.div>
  );
}

function MessageModal({ message, isUnlocked, onClose, theme, wall }: { message: Message; isUnlocked: boolean; onClose: () => void; theme: ThemeConfig; wall: Wall }) {
  const unlockDateString = new Date(wall.unlock_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm bg-white rounded-4xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className={`h-32 ${theme.bg} flex items-center justify-center relative`}>
          <div className="text-6xl animate-bounce">{STAMPS[message.stamp as StampType].icon}</div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full"><X size={20}/></button>
        </div>
        <div className="p-8 text-center">
          {isUnlocked ? (
            <div className="space-y-4">
              <span className="text-rose-500 font-bold text-xs uppercase tracking-widest">A message from {message.author}</span>
              <p className="text-xl font-serif italic text-gray-700 leading-relaxed whitespace-pre-wrap">"{message.body}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-gray-900">It's Sealed Tight!</h3>
              <p className="text-gray-500 text-sm">Unlocks on {wall.type === 'valentine' ? "Feb 14th" : unlockDateString}.</p>
              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                <p className="text-[10px] font-bold text-rose-400 uppercase mb-2 text-left">Sender's Hint:</p>
                <p className="text-lg font-bold text-rose-700">"{message.hint}"</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-gray-50 border-t flex justify-center">
          <button onClick={onClose} className="text-gray-400 font-bold uppercase text-xs">Close</button>
        </div>
      </motion.div>
    </div>
  );
}