import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'silver' | 'cyan' | 'mint' | 'amber' | 'purple';
  onClick?: () => void;
  interactive?: boolean;
}

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'silver',
  onClick,
  interactive = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const glowColorsMap = {
    silver: 'rgba(244, 244, 245, 0.12)',
    cyan: 'rgba(56, 189, 248, 0.18)',
    mint: 'rgba(52, 211, 153, 0.16)',
    amber: 'rgba(251, 191, 36, 0.16)',
    purple: 'rgba(192, 132, 252, 0.16)'
  };

  const borderHighlightMap = {
    silver: 'hover:border-zinc-500/60',
    cyan: 'hover:border-sky-500/60',
    mint: 'hover:border-emerald-500/60',
    amber: 'hover:border-amber-500/60',
    purple: 'hover:border-purple-500/60'
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={interactive ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`relative rounded-2xl bg-[#111319]/85 backdrop-blur-xl border border-zinc-800/80 ${borderHighlightMap[glowColor]} transition-colors duration-300 overflow-hidden shadow-xl shadow-black/40 ${interactive ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Specular Radial Spotlight on Hover */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColorsMap[glowColor]}, transparent 80%)`
          }}
        />
      )}

      {/* Subtle Ambient Top Edge Sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-600/30 to-transparent" />

      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
