import React from 'react';

interface Props {
  className?: string;
  size?: number;
  animate?: boolean;
}

export const AshokaChakra: React.FC<Props> = ({ className = 'w-5 h-5', size = 24, animate = false }) => {
  // 24 spokes at 15 degree intervals
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`${className} ${animate ? 'animate-spin' : ''}`}
      style={{ animationDuration: '24s' }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ashoka Chakra"
    >
      {/* Outer Rim */}
      <circle cx="50" cy="50" r="46" stroke="#000080" strokeWidth="4" />
      <circle cx="50" cy="50" r="42" stroke="#000080" strokeWidth="1.5" />

      {/* Center Hub */}
      <circle cx="50" cy="50" r="10" fill="#000080" />
      <circle cx="50" cy="50" r="5" fill="#FFFFFF" />

      {/* 24 Spoke Lines */}
      {spokes.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x2 = 50 + 42 * Math.cos(rad);
        const y2 = 50 + 42 * Math.sin(rad);
        return (
          <line
            key={angle}
            x1="50"
            y1="50"
            x2={x2}
            y2={y2}
            stroke="#000080"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}

      {/* Rim Nodes between spokes */}
      {spokes.map((angle) => {
        const rad = ((angle + 7.5) * Math.PI) / 180;
        const cx = 50 + 44 * Math.cos(rad);
        const cy = 50 + 44 * Math.sin(rad);
        return (
          <circle
            key={`node-${angle}`}
            cx={cx}
            cy={cy}
            r="1.8"
            fill="#000080"
          />
        );
      })}
    </svg>
  );
};
