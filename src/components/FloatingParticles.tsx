'use client';
import React, { useEffect, useState } from 'react';
import { Heart, Circle } from 'lucide-react'; // Circle looks like a balloon

export default function FloatingParticles({ type }: { type: 'valentine' | 'birthday' }) {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${10 + Math.random() * 20}s`,
      color: type === 'valentine' ? 'text-rose-400' : 'text-blue-400'
    }));
    setParticles(generated);
  }, [type]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div key={p.id} className={`absolute -bottom-12.5 animate-float ${p.color}`} style={{ left: p.left, animationDuration: p.duration }}>
          {type === 'valentine' ? <Heart fill="currentColor" size={20} /> : <div className="w-6 h-8 bg-current rounded-full relative"><div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-current opacity-30" /></div>}
        </div>
      ))}
    </div>
  );
}