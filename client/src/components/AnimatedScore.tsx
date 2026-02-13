import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedScoreProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  sublabel?: string;
  className?: string;
}

const sizeMap = {
  sm: { ring: 'w-20 h-20', text: 'text-2xl', border: 'border-[3px]', labelSize: 'text-xs' },
  md: { ring: 'w-28 h-28', text: 'text-4xl', border: 'border-4', labelSize: 'text-sm' },
  lg: { ring: 'w-36 h-36', text: 'text-5xl', border: 'border-4', labelSize: 'text-lg' },
};

const scoreColor = (s: number) => {
  if (s >= 80) return { text: 'text-emerald-400', border: 'border-emerald-400', glow: 'shadow-emerald-400/20' };
  if (s >= 60) return { text: 'text-green-400', border: 'border-green-400', glow: 'shadow-green-400/20' };
  if (s >= 40) return { text: 'text-yellow-400', border: 'border-yellow-400', glow: 'shadow-yellow-400/20' };
  if (s >= 20) return { text: 'text-orange-400', border: 'border-orange-400', glow: 'shadow-orange-400/20' };
  return { text: 'text-red-400', border: 'border-red-400', glow: 'shadow-red-400/20' };
};

const AnimatedScore: React.FC<AnimatedScoreProps> = ({
  value,
  size = 'md',
  label,
  sublabel,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1000; // 1 second
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * value);
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  const s = sizeMap[size];
  const colors = scoreColor(displayValue);

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col items-center ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {label && (
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-3 font-medium">{label}</p>
      )}
      <div
        className={`${s.ring} rounded-full ${s.border} ${colors.border} flex items-center justify-center mb-3
          shadow-lg ${colors.glow} transition-all duration-500`}
      >
        <span className={`${s.text} font-extrabold ${colors.text} tabular-nums`}>
          {displayValue}
        </span>
      </div>
      {sublabel && (
        <span className={`${s.labelSize} font-semibold ${colors.text}`}>{sublabel}</span>
      )}
    </motion.div>
  );
};

export default AnimatedScore;
