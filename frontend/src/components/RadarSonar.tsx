import React from 'react';
import { motion } from 'framer-motion';

interface RadarSonarProps {
  size?: number;
  className?: string;
  showTargets?: boolean;
}

export const RadarSonar: React.FC<RadarSonarProps> = ({
  size = 280,
  className = '',
  showTargets = true
}) => {
  const targets = [
    { x: 38, y: 32, label: 'Artemisia annua', delay: 0 },
    { x: 68, y: 44, label: 'Curcuma longa', delay: 1.2 },
    { x: 52, y: 72, label: 'Withania somnifera', delay: 2.1 },
    { x: 26, y: 64, label: 'Rauvolfia serpentina', delay: 3.4 },
    { x: 74, y: 22, label: 'Ginkgo biloba', delay: 4.0 },
  ];

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full bg-[#0d0f14] border border-zinc-700/60 p-2 shadow-2xl shadow-black/80 flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      {/* Background Grid Crosshairs */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-zinc-700/40" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-zinc-700/40" />
      <div className="absolute inset-0 rotate-45 border-t border-zinc-800/40" />
      <div className="absolute inset-0 -rotate-45 border-t border-zinc-800/40" />

      {/* Concentric Range Rings */}
      <div className="absolute inset-[15%] rounded-full border border-zinc-800/70" />
      <div className="absolute inset-[32%] rounded-full border border-zinc-800/60" />
      <div className="absolute inset-[50%] rounded-full border border-zinc-800/50" />
      <div className="absolute inset-[68%] rounded-full border border-zinc-800/40" />

      {/* Center Core */}
      <div className="relative z-10 w-3 h-3 rounded-full bg-zinc-200 border-2 border-zinc-900 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />

      {/* Rotating Radar Sweep Beam */}
      <div
        className="absolute inset-0 rounded-full animate-radar origin-center pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, rgba(56, 189, 248, 0.35) 0deg, rgba(52, 211, 153, 0.15) 45deg, transparent 90deg, transparent 360deg)'
        }}
      />

      {/* Target Blips */}
      {showTargets &&
        targets.map((tgt, idx) => (
          <div
            key={idx}
            className="absolute z-20 group cursor-pointer"
            style={{ left: `${tgt.x}%`, top: `${tgt.y}%` }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: tgt.delay }}
              className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-white shadow-[0_0_8px_#38bdf8]"
            />
            {/* Tooltip on Hover */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap bg-zinc-950/95 border border-zinc-700 text-[10px] text-zinc-200 font-mono px-2 py-0.5 rounded shadow-xl pointer-events-none z-30">
              {tgt.label}
            </div>
          </div>
        ))}

      {/* Range Ring Labels */}
      <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
        RADAR 360°
      </span>
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
        FREQ: 4.8 GHz
      </span>
    </div>
  );
};

