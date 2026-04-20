"use client";

import React from 'react';
import { cn } from '@/lib/utils';

const variantColors = {
  default: 'var(--color-primary)',
  success: '#10B981',
  warning: 'var(--color-primary)',
  danger: '#EF4444',
};

const sizeMap = {
  sm: { w: 34, h: 20, cx1: 10, cy: 10, r: 6.5, cx2: 24, dropCx: 23, dropCy: -0.5, dropR: 1.5, travel: 8 },
  md: { w: 52, h: 32, cx1: 16, cy: 16, r: 10, cx2: 36, dropCx: 35, dropCy: -1, dropR: 2.5, travel: 12 },
  lg: { w: 64, h: 40, cx1: 20, cy: 20, r: 12.5, cx2: 44, dropCx: 43, dropCy: -1, dropR: 3, travel: 14 },
};

interface ToggleProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Toggle({
  checked = false,
  onCheckedChange,
  className,
  variant = 'default',
  size = 'md'
}: ToggleProps) {
  const [isChecked, setIsChecked] = React.useState(checked);

  React.useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleClick = () => {
    const next = !isChecked;
    setIsChecked(next);
    onCheckedChange?.(next);
  };

  const s = sizeMap[size];
  const activeColor = variantColors[variant];
  const trackColor = isChecked ? activeColor : 'var(--color-muted, #D2D6E9)';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={handleClick}
      className={cn("relative block cursor-pointer shrink-0", className)}
      style={{ width: s.w, height: s.h }}
    >
      {/* Track background */}
      <div
        className="absolute inset-0 rounded-full transition-colors duration-500"
        style={{ backgroundColor: trackColor }}
      />

      {/* Gooey SVG circles */}
      <svg
        viewBox={`0 0 ${s.w} ${s.h}`}
        filter="url(#goo)"
        className="pointer-events-none absolute inset-0 fill-white"
        style={{ width: s.w, height: s.h }}
      >
        <circle
          cx={s.cx1}
          cy={s.cy}
          r={s.r}
          style={{
            transformOrigin: `${s.cx1}px ${s.cy}px`,
            transform: `translateX(${isChecked ? `${s.travel}px` : '0px'}) scale(${isChecked ? 0 : 1})`,
            transition: 'transform 500ms',
          }}
        />
        <circle
          cx={s.cx2}
          cy={s.cy}
          r={s.r}
          style={{
            transformOrigin: `${s.cx2}px ${s.cy}px`,
            transform: `translateX(${isChecked ? '0px' : `-${s.travel}px`}) scale(${isChecked ? 1 : 0})`,
            transition: 'transform 500ms',
          }}
        />
        {isChecked && (
          <circle
            cx={s.dropCx}
            cy={s.dropCy}
            r={s.dropR}
            style={{ transition: 'transform 700ms' }}
          />
        )}
      </svg>
    </button>
  );
}

export function GooeyFilter() {
  return (
    <svg className="fixed" style={{ width: 0, height: 0 }}>
      <defs>
        <filter id="goo">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="2"
            result="blur"
          />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="goo"
          />
          <feComposite
            in="SourceGraphic"
            in2="goo"
            operator="atop"
          />
        </filter>
      </defs>
    </svg>
  );
}
