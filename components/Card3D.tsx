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
  glowColor = 'rgba(52, 211, 153, 0.25)',
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

    // Max 10 deg tilt
    const ry = ((x / rect.width) - 0.5) * 18;
    const rx = -((y / rect.height) - 0.5) * 18;

    setCoords({ rx, ry, px, py });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ rx: 0, ry: 0, px: 50, py: 50 });
  };

  return (
    <div
      style={{ perspective: '1000px' }}
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
            ? `rotateX(${coords.rx}deg) rotateY(${coords.ry}deg) translateZ(10px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out'
        }}
        className={`relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-xl shadow-xl transition-shadow duration-300 ${
          isHovered ? 'shadow-[0_15px_35px_rgba(0,0,0,0.5)] border-emerald-500/40' : ''
        } ${className}`}
      >
        {/* Dynamic Specular Light Glare following cursor */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle at ${coords.px}% ${coords.py}%, ${glowColor} 0%, transparent 65%)`
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
