import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.2,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0
}) => {
  const [displayValue, setDisplayValue] = useState<string>(
    decimals > 0 ? (0).toFixed(decimals) : '0'
  );

  const spring = useSpring(0, {
    stiffness: 75,
    damping: 18,
    duration: duration * 1000
  });

  const formatted = useTransform(spring, (current) => {
    return decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString();
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = formatted.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [formatted]);

  return (
    <motion.span className={`inline-block font-mono tracking-tight ${className}`}>
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  );
};

