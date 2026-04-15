'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { encryptMessage } from '@/lib/encryption';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function MigratePage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [processedCount, setProcessedCount] = useState(0);
  const [totalEncrypted, setTotalEncrypted] = useState(0);

  const runMigration = async () => {
    const confirmAction = confirm("Are you sure? This will encrypt all 1,361+ messages. This might take a minute.");
    if (!confirmAction) return;

    setStatus('running');
    let hasMore = true;
    let offset = 0;
    const pageSize = 200; // Process in smaller chunks for reliability
    let totalDone = 0;

    while (hasMore) {
      // 1. Fetch a "Page" of 200 messages
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .range(offset, offset + pageSize - 1);

      if (error || !messages || messages.length === 0) {
        hasMore = false;
        break;
      }

      // 2. Encrypt each message in this page
      for (const msg of messages) {
        // Only encrypt if it's NOT already encrypted
        if (!msg.body.startsWith('U2FsdGVkX1')) {
          const encryptedBody = encryptMessage(msg.body, msg.wall_id);

          const { error: updateError } = await supabase
            .from('messages')
            .update({ body: encryptedBody })
            .eq('id', msg.id);
          
          if (!updateError) {
            totalDone++;
            setTotalEncrypted(totalDone);
          }
        }
        // Count every message we look at
        setProcessedCount(prev => prev + 1);
      }

      // 3. Move to the next page
      offset += pageSize;
      
      // Safety break to prevent infinite loops
      if (offset > 5000) hasMore = false; 
    }

    setStatus('done');
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-[40px] p-10 border border-slate-700 text-center shadow-2xl">
        <ShieldCheck className="mx-auto mb-6 text-emerald-400" size={60} />
        <h1 className="text-3xl font-black mb-2 tracking-tighter">Bulk Encryptor</h1>
        <p className="text-slate-400 text-sm mb-8">
          Found {processedCount} messages. <br/>
          Encrypting legacy data for your 169+ users.
        </p>

        {status === 'idle' && (
          <button onClick={runMigration} className="w-full py-5 bg-emerald-500 rounded-2xl font-black text-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
            Start Bulk Process
          </button>
        )}

        {status === 'running' && (
          <div className="space-y-6">
            <Loader2 className="animate-spin mx-auto text-emerald-400" size={40} />
            <div className="space-y-1">
               <p className="font-black text-3xl text-emerald-400">{totalEncrypted}</p>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Messages Secured</p>
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="animate-in zoom-in-95">
            <div className="bg-emerald-500/10 border border-emerald-500/50 p-6 rounded-3xl mb-6">
              <p className="text-emerald-400 font-bold text-lg">Mission Accomplished!</p>
              <p className="text-emerald-400/70 text-xs mt-1">Total encrypted: {totalEncrypted}</p>
            </div>
            <button onClick={() => window.location.href = '/dashboard'} className="text-gray-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors">Finish & Exit</button>
          </div>
        )}
      </div>
    </main>
  );
}