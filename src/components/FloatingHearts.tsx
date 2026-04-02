'use client';
import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

// Use a fallback of 'text-rose-400' if color is missing
export default function FloatingHearts({ color }: { color?: string }) {
  const [hearts, setHearts] = useState<any[]>([]);

  useEffect(() => {
  // 1. Check if we are on a mobile screen (smaller than 768px)
  const isMobile = window.innerWidth < 768;
  
  // 2. Reduce heart count on mobile (8 instead of 15) to save battery/CPU
  const heartCount = isMobile ? 8 : 15;

  const generatedHearts = Array.from({ length: heartCount }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: `${10 + Math.random() * 20}s`,
    delay: `${Math.random() * 10}s`,
    opacity: 0.1 + Math.random() * 0.3,
    scale: 0.5 + Math.random() * 1,
  }));
  
  setHearts(generatedHearts);
}, []);

  // Important: If hearts haven't generated yet, don't show anything
  if (hearts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          // Added || 'text-rose-400' as a safety fallback
          className={`absolute bottom-25 ${color || 'text-rose-400'} animate-float`}
          style={{
            left: heart.left,
            animationDuration: heart.duration,
            animationDelay: heart.delay,
            opacity: heart.opacity,
            transform: `scale(${heart.scale})`,
            willChange: 'transform',
          }}
        >
          {/* Ensure fill-current is present so the color applies to the inside */}
          <Heart className="fill-current" size={24} />
        </div>
      ))}
    </div>
  );
}