'use client';

import React, { useEffect, useRef, useState } from 'react';

export type NovaState = 'IDLE' | 'LISTENING' | 'THINKING' | 'CLASSIFYING' | 'CASE_CREATED';

interface NovaHeroCoreProps {
  state?: NovaState;
  interactive?: boolean;
  className?: string;
  onCoreClick?: () => void;
}

export default function NovaHeroCore({
  state = 'IDLE',
  interactive = true,
  className = '',
  onCoreClick
}: NovaHeroCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1));
    let height = (canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      height = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    };

    window.addEventListener('resize', handleResize);

    // Mouse angles
    let targetRotX = 0.2;
    let targetRotY = 0;
    let rotX = 0.2;
    let rotY = 0;
    let autoRot = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      targetRotY = ((cx / rect.width) - 0.5) * 1.8;
      targetRotX = -((cy / rect.height) - 0.5) * 1.4;
    };

    const handleMouseLeave = () => {
      targetRotX = 0.2;
      targetRotY = 0;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // 3D Particles around NOVA Core
    const particleCount = 90;
    const particles = Array.from({ length: particleCount }, () => {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 130 + Math.random() * 80;
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        baseR: r,
        size: Math.random() * 2.2 + 0.8,
        speed: (Math.random() - 0.5) * 0.02,
        phase: Math.random() * Math.PI * 2
      };
    });

    // 3D Projected helper
    const fov = 420;
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

    const render = () => {
      time += 0.016;

      // Adjust rotation speed depending on state
      const rotSpeed = state === 'THINKING' ? 0.015 : state === 'CLASSIFYING' ? 0.012 : 0.005;
      autoRot += rotSpeed;

      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;

      const effectiveRotY = rotY + autoRot;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // 1. Volumetric Atmosphere Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, width * 0.45);
      const glowAlpha = state === 'LISTENING' ? 0.35 : state === 'CLASSIFYING' ? 0.4 : state === 'CASE_CREATED' ? 0.5 : 0.22;
      glowGrad.addColorStop(0, `rgba(6, 182, 212, ${glowAlpha})`);
      glowGrad.addColorStop(0.35, `rgba(168, 85, 247, ${glowAlpha * 0.7})`);
      glowGrad.addColorStop(0.7, `rgba(59, 130, 246, ${glowAlpha * 0.3})`);
      glowGrad.addColorStop(1, 'rgba(3, 7, 18, 0)');

      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render 3D Torus / Ribbon Ring Structures (Aevon Style)
      const ringSegments = 64;
      const ringCount = 3;

      for (let rIdx = 0; rIdx < ringCount; rIdx++) {
        const radius = 100 + rIdx * 35;
        const ringAngleOffset = rIdx * (Math.PI / 3) + (state === 'THINKING' ? time * 1.5 : time * 0.4);
        const ringTilt = (rIdx - 1) * 0.4;

        ctx.save();
        ctx.beginPath();

        const colorMap = [
          'rgba(34, 211, 238, 0.75)', // Electric Cyan
          'rgba(168, 85, 247, 0.7)',  // Violet / Purple
          'rgba(59, 130, 246, 0.8)'   // Electric Blue
        ];
        ctx.strokeStyle = colorMap[rIdx % colorMap.length];
        ctx.lineWidth = 2.5 + (state === 'CLASSIFYING' ? 1.5 : 0);

        let firstPoint: any = null;

        for (let i = 0; i <= ringSegments; i++) {
          const theta = (i / ringSegments) * Math.PI * 2;
          const px = Math.cos(theta) * radius;
          const pz = Math.sin(theta) * radius;
          const py = Math.sin(theta * 2 + ringAngleOffset) * (24 + rIdx * 8) + Math.cos(theta + ringTilt) * 15;

          const cosY = Math.cos(effectiveRotY + rIdx * 0.2);
          const sinY = Math.sin(effectiveRotY + rIdx * 0.2);
          const cosX = Math.cos(rotX + ringTilt);
          const sinX = Math.sin(rotX + ringTilt);

          const x1 = px * cosY - pz * sinY;
          const z1 = px * sinY + pz * cosY;
          const y1 = py * cosX - z1 * sinX;
          const z2 = py * sinX + z1 * cosX;

          const proj = project(x1, y1, z2, cx, cy);

          if (proj.visible) {
            if (i === 0) {
              firstPoint = proj;
              ctx.moveTo(proj.x, proj.y);
            } else {
              ctx.lineTo(proj.x, proj.y);
            }
          }
        }

        ctx.stroke();

        // Active Energy Nodes traveling along rings
        const nodeProgress = ((time * (0.6 + rIdx * 0.2)) % 1);
        const nodeTheta = nodeProgress * Math.PI * 2;
        const nx = Math.cos(nodeTheta) * radius;
        const nz = Math.sin(nodeTheta) * radius;
        const ny = Math.sin(nodeTheta * 2 + ringAngleOffset) * (24 + rIdx * 8) + Math.cos(nodeTheta + ringTilt) * 15;

        const cosY = Math.cos(effectiveRotY + rIdx * 0.2);
        const sinY = Math.sin(effectiveRotY + rIdx * 0.2);
        const cosX = Math.cos(rotX + ringTilt);
        const sinX = Math.sin(rotX + ringTilt);

        const nx1 = nx * cosY - nz * sinY;
        const nz1 = nx * sinY + nz * cosY;
        const ny1 = ny * cosX - nz1 * sinX;
        const nz2 = ny * sinX + nz1 * cosX;

        const nProj = project(nx1, ny1, nz2, cx, cy);

        if (nProj.visible) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(nProj.x, nProj.y, 4.5 * nProj.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      }

      // 3. Floating 3D Particles & Energy Cloud
      particles.forEach((p) => {
        const cosY = Math.cos(effectiveRotY * 0.8);
        const sinY = Math.sin(effectiveRotY * 0.8);
        const rx = p.x * cosY - p.z * sinY;
        const rz = p.x * sinY + p.z * cosY;
        const ry = p.y + Math.sin(time + p.phase) * 10;

        const proj = project(rx, ry, rz, cx, cy);
        if (proj.visible) {
          const alpha = Math.max(0.15, Math.min(0.85, proj.scale * 0.9));
          ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Central Deep Metallic NOVA Core Sphere
      const corePulse = state === 'LISTENING'
        ? 1 + Math.sin(time * 6) * 0.12
        : state === 'THINKING'
        ? 1 + Math.sin(time * 8) * 0.08
        : state === 'CASE_CREATED'
        ? 1 + Math.sin(time * 3) * 0.18
        : 1 + Math.sin(time * 2) * 0.04;

      const coreRadius = 52 * corePulse;

      // Dark Core Body with subtle specular reflection
      const coreGrad = ctx.createRadialGradient(
        cx - coreRadius * 0.35,
        cy - coreRadius * 0.35,
        4,
        cx,
        cy,
        coreRadius
      );
      coreGrad.addColorStop(0, '#38bdf8');
      coreGrad.addColorStop(0.2, '#1e293b');
      coreGrad.addColorStop(0.8, '#090d16');
      coreGrad.addColorStop(1, '#020408');

      ctx.save();
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Outer Core Electric Rim
      ctx.strokeStyle = state === 'CLASSIFYING' ? '#a855f7' : '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Central Emblem / Logo
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('NOVA', cx, cy);

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [state, interactive]);

  const stateLabels: Record<NovaState, { text: string; color: string }> = {
    IDLE: { text: 'NOVA INTELLIGENCE • ACTIVE', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30' },
    LISTENING: { text: 'NOVA LISTENING LIVE...', color: 'text-emerald-400 bg-emerald-950/70 border-emerald-500/50 animate-pulse' },
    THINKING: { text: 'PROCESSING CITIZEN CASE...', color: 'text-purple-400 bg-purple-950/70 border-purple-500/50 animate-pulse' },
    CLASSIFYING: { text: 'CLASSIFYING STATUTORY JURISDICTION...', color: 'text-sky-400 bg-sky-950/70 border-sky-500/50' },
    CASE_CREATED: { text: 'CASE DOSSIER SECURELY GENERATED ✓', color: 'text-emerald-300 bg-emerald-950/80 border-emerald-400/60' }
  };

  const currentState = stateLabels[state] || stateLabels.IDLE;

  return (
    <div
      ref={containerRef}
      onClick={onCoreClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative w-full h-[440px] sm:h-[500px] lg:h-[560px] rounded-3xl overflow-hidden flex flex-col justify-between select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Top Status Pill */}
      <div className="relative z-10 p-5 flex items-center justify-between pointer-events-none">
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md text-xs font-mono font-bold tracking-wider ${currentState.color}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span>{currentState.text}</span>
        </div>
      </div>

      {/* Bottom Subtitle / Interaction Note */}
      <div className="relative z-10 p-5 bg-gradient-to-t from-[#020408]/90 via-[#020408]/50 to-transparent flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>CITIZEN INTELLIGENCE CORE</span>
        </span>
        <span className="text-slate-500 hidden sm:inline">Drag to rotate in 3D</span>
      </div>
    </div>
  );
}
