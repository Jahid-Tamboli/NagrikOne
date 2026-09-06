'use client';

import React, { useRef, useState } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}

export default function Card3D({
  children,
  className = '',
  glowColor = 'rgba(52, 211, 153, 0.3)',
  onClick
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState({ rx: 0, ry: 0, px: 50, py: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    const ry = ((x / rect.width) - 0.5) * 14;
    const rx = -((y / rect.height) - 0.5) * 14;

    setCoords({ rx, ry, px, py });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ rx: 0, ry: 0, px: 50, py: 50 });
  };

  return (
    <div
      style={{ perspective: '1200px' }}
      className="inline-block w-full h-full"
    >
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${coords.rx}deg) rotateY(${coords.ry}deg) translateZ(12px) translateY(-4px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px) translateY(0px)',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#0b1b2d] via-[#081322] to-[#040a14] backdrop-blur-2xl shadow-xl transition-all duration-300 ${
          isHovered
            ? 'border-emerald-400/60 shadow-[0_20px_45px_rgba(0,0,0,0.6),0_0_35px_rgba(52,211,153,0.2)]'
            : 'border-slate-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.4)]'
        } ${className}`}
      >
        {/* Specular Glare */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle at ${coords.px}% ${coords.py}%, ${glowColor} 0%, transparent 60%)`
            }}
          />
        )}
        <div className="relative z-20 w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
