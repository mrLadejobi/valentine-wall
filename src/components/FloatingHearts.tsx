'use client';
import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<any[]>([]);

  useEffect(() => {
    // Generate hearts only on the client side
    const generatedHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${10 + Math.random() * 20}s`,
      delay: `${Math.random() * 10}s`,
      opacity: 0.1 + Math.random() * 0.3,
      scale: 0.5 + Math.random() * 1,
    }));
    setHearts(generatedHearts);
  }, []);

  // Return null or empty div during server-side rendering
  if (hearts.length === 0) return <div className="fixed inset-0 pointer-events-none" />;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute -bottom-25 text-rose-400 animate-float"
          style={{
            left: heart.left,
            animationDuration: heart.duration,
            animationDelay: heart.delay,
            opacity: heart.opacity,
            transform: `scale(${heart.scale})`,
          }}
        >
          <Heart className="fill-current" size={24} />
        </div>
      ))}
    </div>
  );
}