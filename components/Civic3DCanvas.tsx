'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Node3D {
  label: string;
  sublabel: string;
  category: string;
  x: number;
  y: number;
  z: number;
  color: string;
  radius: number;
  glow: string;
  pulsePhase: number;
}

export default function Civic3DCanvas({ onSelectCategory }: { onSelectCategory?: (category: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [stats, setStats] = useState({ activeCases: 1420, verifiedRoutes: 99, resolvedToday: 342 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1));
    let height = (canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      height = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    };

    window.addEventListener('resize', handleResize);

    // 3D Nodes representing resolution networks
    const nodes: Node3D[] = [
      { label: 'CIVIC & PWD', sublabel: 'Municipal Ward / PWD', category: 'Civic & Municipal', x: -150, y: -40, z: 30, color: '#34d399', glow: 'rgba(52, 211, 153, 0.5)', radius: 20, pulsePhase: 0 },
      { label: 'CYBER DEFENSE', sublabel: '1930 / I4C Portal', category: 'Cyber & Online Fraud', x: 140, y: -50, z: -30, color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.5)', radius: 22, pulsePhase: 1 },
      { label: 'POLICE & SAFETY', sublabel: 'BNSS / Mahila Desk', category: 'Police & Safety', x: 0, y: -140, z: 40, color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.5)', radius: 19, pulsePhase: 2 },
      { label: 'BANKING OMBUDSMAN', sublabel: 'RBI CMS Portal', category: 'Banking & Finance', x: -110, y: 110, z: 50, color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.5)', radius: 18, pulsePhase: 3 },
      { label: 'CONSUMER COURT', sublabel: 'e-Daakhil / NCH 1915', category: 'Consumer & E-Commerce', x: 110, y: 100, z: 40, color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)', radius: 19, pulsePhase: 4 },
      { label: 'WOMEN RIGHTS', sublabel: 'POSH / Helpline 181', category: 'Women Safety & Rights', x: -160, y: 30, z: -80, color: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)', radius: 18, pulsePhase: 5 },
      { label: 'TELECOM & TRAI', sublabel: 'TRAI QoS / Sanchar Saathi', category: 'Telecom & Broadband', x: 150, y: 20, z: -90, color: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.5)', radius: 17, pulsePhase: 6 }
    ];

    // Background floating 3D particle dust
    const particles = Array.from({ length: 70 }, () => ({
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 500,
      z: (Math.random() - 0.5) * 500,
      size: Math.random() * 2.5 + 0.8,
      speed: Math.random() * 0.005 + 0.002
    }));

    // Mouse interactive angles
    let targetRotX = 0.15;
    let targetRotY = 0;
    let rotX = 0.15;
    let rotY = 0;
    let autoRotation = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      targetRotY = ((clientX / rect.width) - 0.5) * 1.5;
      targetRotX = -((clientY / rect.height) - 0.5) * 1.2;
    };

    const handleMouseLeave = () => {
      targetRotX = 0.15;
      targetRotY = 0;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const fov = 400;
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
      time += 0.015;
      autoRotation += 0.004;

      rotX += (targetRotX - rotX) * 0.06;
      rotY += (targetRotY - rotY) * 0.06;

      const effectiveRotY = rotY + autoRotation;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw cyber radial background glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, width * 0.65);
      bgGrad.addColorStop(0, 'rgba(16, 185, 129, 0.14)');
      bgGrad.addColorStop(0.35, 'rgba(6, 182, 212, 0.08)');
      bgGrad.addColorStop(1, 'rgba(4, 9, 20, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render 3D Perspective Grid
      ctx.save();
      ctx.strokeStyle = 'rgba(30, 58, 88, 0.35)';
      ctx.lineWidth = 1;
      const gridY = 170;
      for (let gx = -260; gx <= 260; gx += 40) {
        const cosY = Math.cos(effectiveRotY * 0.3);
        const sinY = Math.sin(effectiveRotY * 0.3);
        const rx1 = gx * cosY - (-220) * sinY;
        const rz1 = gx * sinY + (-220) * cosY;
        const rx2 = gx * cosY - (220) * sinY;
        const rz2 = gx * sinY + (220) * cosY;

        const p1 = project(rx1, gridY, rz1, cx, cy);
        const p2 = project(rx2, gridY, rz2, cx, cy);

        if (p1.visible && p2.visible) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Render Holographic Rings in 3D
      ctx.save();
      const ringAngles = [time * 0.5, -time * 0.7, time * 0.3];
      const ringRadii = [160, 200, 240];
      const ringColors = ['rgba(56, 189, 248, 0.25)', 'rgba(52, 211, 153, 0.2)', 'rgba(167, 139, 250, 0.15)'];

      ringRadii.forEach((r, idx) => {
        ctx.beginPath();
        ctx.strokeStyle = ringColors[idx];
        ctx.lineWidth = 1.5;
        const segments = 48;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const px = Math.cos(theta) * r;
          const pz = Math.sin(theta) * r;
          const py = Math.sin(theta * 2 + ringAngles[idx]) * 20;

          const cosY = Math.cos(effectiveRotY);
          const sinY = Math.sin(effectiveRotY);
          const cosX = Math.cos(rotX);
          const sinX = Math.sin(rotX);

          const x1 = px * cosY - pz * sinY;
          const z1 = px * sinY + pz * cosY;
          const y1 = py * cosX - z1 * sinX;
          const z2 = py * sinX + z1 * cosX;

          const proj = project(x1, y1, z2, cx, cy);
          if (i === 0) ctx.moveTo(proj.x, proj.y);
          else ctx.lineTo(proj.x, proj.y);
        }
        ctx.stroke();
      });
      ctx.restore();

      // Floating particles
      particles.forEach((p) => {
        const cosY = Math.cos(effectiveRotY * 0.6);
        const sinY = Math.sin(effectiveRotY * 0.6);
        const rx = p.x * cosY - p.z * sinY;
        const rz = p.x * sinY + p.z * cosY;
        const ry = p.y + Math.sin(time + p.x) * 15;

        const proj = project(rx, ry, rz, cx, cy);
        if (proj.visible) {
          const alpha = Math.max(0.1, Math.min(0.8, proj.scale * 0.9));
          ctx.fillStyle = `rgba(167, 243, 208, ${alpha})`;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Project Nodes
      const projectedNodes = nodes.map((node) => {
        const cosY = Math.cos(effectiveRotY);
        const sinY = Math.sin(effectiveRotY);
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);

        const ox = node.x + Math.sin(time + node.pulsePhase) * 6;
        const oy = node.y + Math.cos(time * 0.8 + node.pulsePhase) * 8;
        const oz = node.z;

        const x1 = ox * cosY - oz * sinY;
        const z1 = ox * sinY + oz * cosY;
        const y1 = oy * cosX - z1 * sinX;
        const z2 = oy * sinX + z1 * cosX;

        const proj = project(x1, y1, z2, cx, cy);
        return {
          node,
          proj,
          zDepth: z2
        };
      });

      projectedNodes.sort((a, b) => b.zDepth - a.zDepth);

      // Render Beams to Central Core
      ctx.save();
      const coreProj = project(0, 0, 0, cx, cy);

      projectedNodes.forEach(({ proj, node }, i) => {
        const beamGrad = ctx.createLinearGradient(coreProj.x, coreProj.y, proj.x, proj.y);
        beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        beamGrad.addColorStop(0.7, node.color + '66');
        beamGrad.addColorStop(1, node.color + 'aa');

        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = Math.max(1, 2.5 * proj.scale);
        ctx.beginPath();
        ctx.moveTo(coreProj.x, coreProj.y);

        const midX = (coreProj.x + proj.x) / 2 + Math.sin(time * 2 + i) * 15;
        const midY = (coreProj.y + proj.y) / 2 + Math.cos(time * 2 + i) * 15;
        ctx.quadraticCurveTo(midX, midY, proj.x, proj.y);
        ctx.stroke();

        const pulsePos = ((time * 0.8 + i * 0.3) % 1);
        const pulseX = (1 - pulsePos) * (1 - pulsePos) * coreProj.x + 2 * (1 - pulsePos) * pulsePos * midX + pulsePos * pulsePos * proj.x;
        const pulseY = (1 - pulsePos) * (1 - pulsePos) * coreProj.y + 2 * (1 - pulsePos) * pulsePos * midY + pulsePos * pulsePos * proj.y;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 3.5 * proj.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.restore();

      // Central NagrikOne Core
      const coreScale = coreProj.scale;
      const corePulse = 1 + Math.sin(time * 3) * 0.08;
      const coreRadius = 42 * coreScale * corePulse;

      const coreAura = ctx.createRadialGradient(coreProj.x, coreProj.y, 10, coreProj.x, coreProj.y, coreRadius * 2.2);
      coreAura.addColorStop(0, 'rgba(52, 211, 153, 0.8)');
      coreAura.addColorStop(0.5, 'rgba(6, 182, 212, 0.35)');
      coreAura.addColorStop(1, 'rgba(4, 9, 20, 0)');
      ctx.fillStyle = coreAura;
      ctx.beginPath();
      ctx.arc(coreProj.x, coreProj.y, coreRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      const coreBody = ctx.createRadialGradient(
        coreProj.x - coreRadius * 0.3,
        coreProj.y - coreRadius * 0.3,
        4,
        coreProj.x,
        coreProj.y,
        coreRadius
      );
      coreBody.addColorStop(0, '#6ee7b7');
      coreBody.addColorStop(0.4, '#059669');
      coreBody.addColorStop(1, '#064e3b');

      ctx.fillStyle = coreBody;
      ctx.beginPath();
      ctx.arc(coreProj.x, coreProj.y, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 2 * coreScale;
      ctx.beginPath();
      ctx.arc(coreProj.x, coreProj.y, coreRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#022c22';
      ctx.font = `bold ${Math.round(26 * coreScale)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N1', coreProj.x, coreProj.y + 1);

      // Render Nodes
      projectedNodes.forEach(({ node, proj }) => {
        const radius = node.radius * proj.scale;
        const isHovered = activeNode === node.label;

        ctx.save();
        const aura = ctx.createRadialGradient(proj.x, proj.y, 2, proj.x, proj.y, radius * (isHovered ? 3 : 2));
        aura.addColorStop(0, node.glow);
        aura.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, radius * (isHovered ? 3 : 2), 0, Math.PI * 2);
        ctx.fill();

        const sphereGrad = ctx.createRadialGradient(
          proj.x - radius * 0.3,
          proj.y - radius * 0.3,
          2,
          proj.x,
          proj.y,
          radius
        );
        sphereGrad.addColorStop(0, '#ffffff');
        sphereGrad.addColorStop(0.3, node.color);
        sphereGrad.addColorStop(1, '#041525');

        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isHovered ? '#ffffff' : node.color;
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.stroke();

        const fontSize = Math.max(9, Math.round(11 * proj.scale));
        ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';

        const labelText = node.label;
        const textWidth = ctx.measureText(labelText).width;
        const pillY = proj.y + radius + 14;

        ctx.fillStyle = 'rgba(7, 19, 33, 0.85)';
        ctx.strokeStyle = node.color + '88';
        ctx.lineWidth = 1;
        const padX = 7;
        const padY = 4;
        ctx.beginPath();
        ctx.roundRect(proj.x - textWidth / 2 - padX, pillY - fontSize / 2 - padY, textWidth + padX * 2, fontSize + padY * 2, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, proj.x, pillY);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [activeNode]);

  return (
    <div ref={containerRef} className="relative w-full h-[460px] md:h-[520px] rounded-3xl overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-[#061424] via-[#040c17] to-[#02060c] shadow-[0_0_80px_rgba(6,182,212,0.15)] flex flex-col justify-between">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing block"
      />

      <div className="relative z-10 p-5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-400/30 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="text-[11px] font-mono tracking-wider font-semibold text-emerald-300">
            3D STATUTORY RESOLUTION MESH • LIVE
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Active: <strong className="text-cyan-200">{stats.activeCases}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Routes: <strong className="text-emerald-200">{stats.verifiedRoutes}</strong>
          </span>
        </div>
      </div>

      <div className="relative z-10 p-4 sm:p-5 bg-gradient-to-t from-[#030811]/90 via-[#030811]/60 to-transparent pointer-events-auto">
        <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
          <span>Explore 3D Nodes:</span>
          <span className="text-xs text-emerald-400 font-semibold">Hover or Drag to rotate in 3D</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { name: 'Civic & PWD', cat: 'Civic & Municipal', color: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' },
            { name: 'Cybercrime (1930)', cat: 'Cyber & Online Fraud', color: 'border-rose-500/40 text-rose-300 hover:bg-rose-500/10' },
            { name: 'Police & Safety', cat: 'Police & Safety', color: 'border-sky-500/40 text-sky-300 hover:bg-sky-500/10' },
            { name: 'Banking Ombudsman', cat: 'Banking & Finance', color: 'border-purple-500/40 text-purple-300 hover:bg-purple-500/10' },
            { name: 'Consumer Forum', cat: 'Consumer & E-Commerce', color: 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10' },
            { name: 'Women Safety', cat: 'Women Safety & Rights', color: 'border-pink-500/40 text-pink-300 hover:bg-pink-500/10' },
            { name: 'Telecom Grid', cat: 'Telecom & Broadband', color: 'border-teal-500/40 text-teal-300 hover:bg-teal-500/10' }
          ].map((pill) => (
            <button
              key={pill.name}
              type="button"
              onClick={() => onSelectCategory?.(pill.cat)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border bg-slate-900/70 backdrop-blur-md transition-all duration-200 ${pill.color}`}
            >
              {pill.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
