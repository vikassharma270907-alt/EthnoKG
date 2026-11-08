import React from 'react';
import { motion } from 'framer-motion';

interface WaveformPulseProps {
  isStreaming?: boolean;
  barCount?: number;
  className?: string;
}

export const WaveformPulse: React.FC<WaveformPulseProps> = ({
  isStreaming = false,
  barCount = 18,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-1 h-8 select-none ${className}`}>
      {Array.from({ length: barCount }).map((_, idx) => {
        const heightMultiplier = Math.sin((idx / barCount) * Math.PI);
        const duration = 0.6 + (idx % 5) * 0.15;
        const delay = (idx % 4) * 0.1;

        return (
          <motion.div
            key={idx}
            initial={{ height: 4 }}
            animate={
              isStreaming
                ? {
                    height: [
                      4,
                      Math.max(6, Math.floor(28 * heightMultiplier + (idx % 3) * 3)),
                      4
                    ],
                    opacity: [0.4, 1, 0.4]
                  }
                : {
                    height: Math.max(4, Math.floor(14 * heightMultiplier)),
                    opacity: 0.5
                  }
            }
            transition={
              isStreaming
                ? {
                    duration: duration,
                    repeat: Infinity,
                    delay: delay,
                    ease: 'easeInOut'
                  }
                : { duration: 0.3 }
            }
            className={`w-1 rounded-full ${
              isStreaming
                ? 'bg-gradient-to-t from-zinc-400 via-zinc-200 to-white shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                : 'bg-zinc-600'
            }`}
          />
        );
      })}
    </div>
  );
};

