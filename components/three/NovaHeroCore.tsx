'use client';

import React, { useEffect, useRef, useState } from 'react';

export type NovaState = 
  | 'IDLE' 
  | 'LISTENING' 
  | 'UNDERSTANDING' 
  | 'THINKING' 
  | 'ASKING' 
  | 'CLASSIFYING' 
  | 'PREPARING_SOLUTION' 
  | 'CASE_CREATED' 
  | 'RESOLUTION';

interface NovaHeroCoreProps {
  state?: NovaState;
  amplitude?: number; // 0.0 to 1.0 (from microphone or speech synthesis)
  interactive?: boolean;
  className?: string;
  onCoreClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export default function NovaHeroCore({
  state = 'IDLE',
  amplitude = 0,
  interactive = true,
  className = '',
  onCoreClick,
  size = 'hero'
}: NovaHeroCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);

  // State text mapping as specified in design requirements
  const stateLabels: Record<NovaState, string> = {
    IDLE: 'Ask NOVA',
    LISTENING: "I'm listening.",
    UNDERSTANDING: 'Understanding your problem...',
    THINKING: 'Let me work this out...',
    ASKING: 'Need a few more details...',
    CLASSIFYING: 'Identifying statutory pathway...',
    PREPARING_SOLUTION: 'Preparing the best next step...',
    CASE_CREATED: 'Your case is ready.',
    RESOLUTION: 'Case resolved successfully.'
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = (canvas.width = canvas.offsetWidth * dpr);
    let height = (canvas.height = canvas.offsetHeight * dpr);

    const handleResize = () => {
      if (!canvas) return;
      dpr = window.devicePixelRatio || 1;
      width = canvas.width = canvas.offsetWidth * dpr;
      height = canvas.height = canvas.offsetHeight * dpr;
    };

    window.addEventListener('resize', handleResize);

    // Mouse tilt angles
    let targetRotX = 0.15;
    let targetRotY = 0;
    let rotX = 0.15;
    let rotY = 0;
    let autoRot = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      targetRotY = ((cx / rect.width) - 0.5) * 1.6;
      targetRotX = -((cy / rect.height) - 0.5) * 1.2;
    };

    const handleMouseLeave = () => {
      targetRotX = 0.15;
      targetRotY = 0;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Organic 3D Energy Nodes & Ambient Halo
    const nodeCount = 75;
    const nodes = Array.from({ length: nodeCount }, () => {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 140 + Math.random() * 90;
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        baseR: r,
        size: Math.random() * 2.0 + 0.8,
        speed: (Math.random() - 0.5) * 0.015,
        phase: Math.random() * Math.PI * 2
      };
    });

    // 3D Perspective Projection helper
    const fov = 450;
    function project(x: number, y: number, z: number, cx: number, cy: number) {
      const scale = fov / (fov + z);
      return {
        x: cx + x * scale,
        y: cy + y * scale,
        scale,
        visible: z > -fov
      };
    }

    let time = 0;
    let smoothAmp = 0;
    let caseCreatedPulse = 0;

    const render = () => {
      time += 0.016;

      // Smooth amplitude reaction
      smoothAmp += (amplitude - smoothAmp) * 0.18;

      // Rotation speed based on state
      let speedMultiplier = 0.006;
      if (state === 'THINKING') speedMultiplier = 0.022;
      else if (state === 'UNDERSTANDING') speedMultiplier = 0.018;
      else if (state === 'CLASSIFYING') speedMultiplier = 0.015;
      else if (state === 'LISTENING') speedMultiplier = 0.008 + smoothAmp * 0.02;

      autoRot += speedMultiplier;
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;

      const effectiveRotY = rotY + autoRot;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const minDim = Math.min(width, height);
      const baseScale = minDim / 460;

      // Pulse handling for CASE_CREATED or ASKING
      let breath = Math.sin(time * 1.8) * 6 * baseScale;
      if (state === 'LISTENING') {
        breath += smoothAmp * 24 * baseScale;
      } else if (state === 'ASKING') {
        breath += Math.sin(time * 4.5) * 8 * baseScale;
      } else if (state === 'UNDERSTANDING') {
        breath -= 12 * baseScale; // Inward contraction
      }

      // ============================================================
      // LAYER 1: DEEP VOLUMETRIC ATMOSPHERE GLOW
      // ============================================================
      const outerGlowRadius = (190 * baseScale) + breath * 2;
      const glowGrad = ctx.createRadialGradient(cx, cy, 20 * baseScale, cx, cy, Math.max(40, outerGlowRadius));
      
      let glowAlpha = 0.28;
      let primaryColor = '34, 211, 238'; // Cyan
      let secondaryColor = '168, 85, 247'; // Purple/Violet

      if (state === 'LISTENING') {
        glowAlpha = 0.45 + smoothAmp * 0.35;
        primaryColor = '6, 182, 212';
      } else if (state === 'UNDERSTANDING') {
        glowAlpha = 0.5;
        primaryColor = '56, 189, 248';
      } else if (state === 'THINKING') {
        glowAlpha = 0.42;
        primaryColor = '147, 51, 234';
        secondaryColor = '59, 130, 246';
      } else if (state === 'CLASSIFYING') {
        glowAlpha = 0.48;
        primaryColor = '16, 185, 129'; // Emerald/Cyan
      } else if (state === 'PREPARING_SOLUTION') {
        glowAlpha = 0.44;
        primaryColor = '14, 165, 233';
      } else if (state === 'CASE_CREATED') {
        glowAlpha = 0.6;
        primaryColor = '52, 211, 153';
      } else if (state === 'RESOLUTION') {
        glowAlpha = 0.35;
        primaryColor = '16, 185, 129';
      }

      glowGrad.addColorStop(0, `rgba(${primaryColor}, ${glowAlpha})`);
      glowGrad.addColorStop(0.4, `rgba(${secondaryColor}, ${glowAlpha * 0.6})`);
      glowGrad.addColorStop(0.75, `rgba(30, 58, 138, ${glowAlpha * 0.25})`);
      glowGrad.addColorStop(1, 'rgba(3, 7, 18, 0)');

      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // ============================================================
      // LAYER 2: MULTI-LAYERED 3D ATMOSPHERIC RINGS (AEVON INSPIRATION)
      // ============================================================
      const ringCount = 3;
      for (let rIdx = 0; rIdx < ringCount; rIdx++) {
        const ringRadius = (105 + rIdx * 32) * baseScale + breath;
        const ringTilt = (rIdx - 1) * 0.35 + (state === 'UNDERSTANDING' ? -0.2 : 0);
        const ringAngleOffset = rIdx * (Math.PI / 3) + (state === 'THINKING' ? time * 1.8 : time * 0.4);

        ctx.save();
        ctx.beginPath();

        const strokeAlpha = state === 'LISTENING' ? 0.85 : 0.65;
        ctx.strokeStyle = rIdx === 0 
          ? `rgba(${primaryColor}, ${strokeAlpha})` 
          : rIdx === 1 
          ? `rgba(${secondaryColor}, ${strokeAlpha * 0.8})` 
          : `rgba(59, 130, 246, ${strokeAlpha * 0.7})`;
        ctx.lineWidth = (2.2 + (rIdx === 0 ? smoothAmp * 3 : 0)) * dpr;

        const segments = 60;
        let firstPt: any = null;

        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          // Torus coordinates
          let x = ringRadius * Math.cos(theta);
          let y = ringRadius * Math.sin(theta) * Math.cos(ringTilt);
          let z = ringRadius * Math.sin(theta) * Math.sin(ringTilt);

          // Rotate around Y axis
          const cosY = Math.cos(effectiveRotY + ringAngleOffset);
          const sinY = Math.sin(effectiveRotY + ringAngleOffset);
          const rx = x * cosY - z * sinY;
          const rz = x * sinY + z * cosY;

          // Rotate around X axis
          const cosX = Math.cos(rotX);
          const sinX = Math.sin(rotX);
          const ry = y * cosX - rz * sinX;
          const finalZ = y * sinX + rz * cosX;

          const proj = project(rx, ry, finalZ, cx, cy);
          if (proj.visible) {
            if (i === 0) {
              firstPt = proj;
              ctx.moveTo(proj.x, proj.y);
            } else {
              ctx.lineTo(proj.x, proj.y);
            }
          }
        }
        if (firstPt) ctx.lineTo(firstPt.x, firstPt.y);
        ctx.stroke();
        ctx.restore();
      }

      // ============================================================
      // LAYER 3: 3D PARTICLES / ENERGY NODES IN ORBIT
      // ============================================================
      nodes.forEach((node) => {
        let currentR = node.baseR * baseScale;
        if (state === 'UNDERSTANDING') currentR *= 0.78; // Inward contraction
        if (state === 'LISTENING') currentR += smoothAmp * 25 * baseScale;

        // Spherical orbital movement
        const currentAngle = node.phase + time * (node.speed * 40);
        let nx = currentR * Math.cos(currentAngle);
        let ny = (node.y * baseScale) + Math.sin(time * 2 + node.phase) * 10 * baseScale;
        let nz = currentR * Math.sin(currentAngle);

        // Apply mouse & state rotation
        const cosY = Math.cos(effectiveRotY * 0.7);
        const sinY = Math.sin(effectiveRotY * 0.7);
        const rx = nx * cosY - nz * sinY;
        const rz = nx * sinY + nz * cosY;

        const cosX = Math.cos(rotX * 0.7);
        const sinX = Math.sin(rotX * 0.7);
        const ry = ny * cosX - rz * sinX;
        const finalZ = ny * sinX + rz * cosX;

        const p = project(rx, ry, finalZ, cx, cy);

        if (p.visible) {
          const alpha = Math.max(0.1, Math.min(0.9, (finalZ + fov) / (fov * 1.6)));
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.6, node.size * p.scale * dpr), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${primaryColor}, ${alpha * (0.5 + smoothAmp * 0.5)})`;
          ctx.fill();
        }
      });

      // ============================================================
      // LAYER 4: CENTRAL DARK INTELLIGENT SPHERE (BLACK CORE + GLOWING RIM)
      // ============================================================
      const coreRadius = (82 * baseScale) + breath * 0.7;

      // Soft luminous edge ring around black core
      const rimGrad = ctx.createRadialGradient(cx, cy, coreRadius * 0.85, cx, cy, coreRadius * 1.12);
      rimGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      rimGrad.addColorStop(0.7, `rgba(${primaryColor}, ${0.85 + (state === 'LISTENING' ? smoothAmp * 0.15 : 0)})`);
      rimGrad.addColorStop(0.95, `rgba(${secondaryColor}, 0.6)`);
      rimGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 1.12, 0, Math.PI * 2);
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // Deep Black Center Sphere
      const coreGrad = ctx.createRadialGradient(
        cx - coreRadius * 0.25,
        cy - coreRadius * 0.25,
        5 * baseScale,
        cx,
        cy,
        coreRadius
      );
      coreGrad.addColorStop(0, '#0c1527'); // Very dark deep cyan-black
      coreGrad.addColorStop(0.5, '#040711'); // Midnight black
      coreGrad.addColorStop(0.92, '#010309'); // Jet black
      coreGrad.addColorStop(1, `rgba(${primaryColor}, 0.4)`); // Luminous boundary

      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.lineWidth = 1.5 * dpr;
      ctx.strokeStyle = `rgba(${primaryColor}, 0.7)`;
      ctx.stroke();

      // Inner Core Energy Pulse Waves (when thinking or listening)
      if (state === 'THINKING' || state === 'UNDERSTANDING' || smoothAmp > 0.05) {
        ctx.save();
        ctx.beginPath();
        const innerWaveR = (coreRadius * 0.5) + Math.sin(time * 6) * 8 * baseScale;
        ctx.arc(cx, cy, innerWaveR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${primaryColor}, 0.4)`;
        ctx.lineWidth = 1.5 * dpr;
        ctx.stroke();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [state, amplitude, interactive]);

  // Size dimensions
  const sizeClasses = {
    sm: 'w-48 h-48 sm:w-56 sm:h-56',
    md: 'w-64 h-64 sm:w-80 sm:h-80',
    lg: 'w-80 h-80 sm:w-96 sm:h-96',
    hero: 'w-72 h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] lg:w-[500px] lg:h-[500px]'
  };

  return (
    <div
      ref={containerRef}
      onClick={onCoreClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex flex-col items-center justify-center cursor-pointer select-none transition-transform duration-300 ${hovered ? 'scale-[1.015]' : ''} ${className}`}
      role="button"
      tabIndex={0}
      aria-label={`NOVA AI Core. Current State: ${stateLabels[state] || state}`}
    >
      {/* 3D Canvas Element */}
      <div className={`relative ${sizeClasses[size]}`}>
        <canvas
          ref={canvasRef}
          className="w-full h-full block touch-none"
        />

        {/* State Indicator Badge floating under/at bottom center */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#030712]/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-[11px] font-mono shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span
              className={`w-2 h-2 rounded-full ${
                state === 'LISTENING'
                  ? 'bg-rose-500 animate-ping'
                  : state === 'THINKING' || state === 'UNDERSTANDING'
                  ? 'bg-amber-400 animate-spin'
                  : state === 'CLASSIFYING'
                  ? 'bg-emerald-400 animate-pulse'
                  : state === 'CASE_CREATED'
                  ? 'bg-emerald-400'
                  : 'bg-cyan-400 animate-pulse'
              }`}
            />
            <span className="font-semibold tracking-wide uppercase">
              {stateLabels[state] || state}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
