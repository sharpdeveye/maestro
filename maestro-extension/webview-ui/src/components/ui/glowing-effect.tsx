"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { animate } from "motion/react";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

export const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 25,
    variant = "default",
    glow = false,
    className,
    movementDuration = 1,
    borderWidth = 2,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const centerX = left + width / 2;
          const centerY = top + height / 2;
          const distanceFromCenter = Math.hypot(mouseX - centerX, mouseY - centerY);
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty("--active", isActive ? "1" : "0");

          if (!isActive) return;

          const currentAngle = parseFloat(element.style.getPropertyValue("--start")) || 0;
          let targetAngle = (180 * Math.atan2(mouseY - centerY, mouseX - centerX)) / Math.PI + 90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty("--start", String(value));
            },
          });
        });
      },
      [inactiveZone, proximity, movementDuration]
    );

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("pointermove", handlePointerMove, { passive: true });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, disabled]);

    // Theme-aware gradient using primary color via CSS custom properties
    const gradient = variant === "white"
      ? `repeating-conic-gradient(
          from 236.84deg at 50% 50%,
          #000,
          #000 calc(25% / var(--repeating-conic-gradient-times))
        )`
      : `radial-gradient(circle at 25% 25%, oklch(from var(--primary) l c h / 0.4) 0%, transparent 30%),
         radial-gradient(circle at 75% 25%, oklch(from var(--primary) l c h / 0.3) 0%, transparent 30%),
         radial-gradient(circle at 25% 75%, oklch(from var(--primary) l c h / 0.3) 0%, transparent 30%),
         radial-gradient(circle at 75% 75%, oklch(from var(--primary) l c h / 0.4) 0%, transparent 30%),
         repeating-conic-gradient(
           from calc(var(--start) * 1deg) at 50% 50%,
           oklch(from var(--primary) l c h / 0.9) 0%,
           oklch(from var(--primary) calc(l * 0.85) calc(c * 1.1) h / 1) calc(25% / var(--repeating-conic-gradient-times)),
           oklch(from var(--primary) calc(l * 1.1) calc(c * 0.9) h / 0.95) calc(50% / var(--repeating-conic-gradient-times)),
           oklch(from var(--primary) calc(l * 0.95) c h / 0.9) calc(75% / var(--repeating-conic-gradient-times)),
           oklch(from var(--primary) l c h / 0.9) calc(100% / var(--repeating-conic-gradient-times))
         )`;

    return (
      <>
        {/* Border overlay */}
        <div
          className={cn(
            "pointer-events-none absolute -inset-px hidden rounded-[inherit] border border-border/40 opacity-0 transition-opacity duration-500",
            glow && "opacity-100",
            disabled && "!block"
          )}
        />
        {/* Glow container */}
        <div
          ref={containerRef}
          style={
            {
              "--blur": `${blur}px`,
              "--spread": spread,
              "--start": "0",
              "--active": "0",
              "--glowingeffect-border-width": `${borderWidth}px`,
              "--repeating-conic-gradient-times": "4",
              "--gradient": gradient,
            } as React.CSSProperties
          }
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity duration-500",
            glow && "opacity-100",
            blur > 0 && "blur-[var(--blur)]",
            className,
            disabled && "!hidden"
          )}
        >
          <div
            className={cn(
              "glow rounded-[inherit] h-full w-full",
              'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
              "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
              "after:[background:var(--gradient)] after:[background-attachment:fixed]",
              "after:opacity-[var(--active)] after:transition-opacity after:duration-500 after:ease-out",
              "after:[mask-clip:padding-box,border-box]",
              "after:[mask-composite:intersect]",
              "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff_calc(var(--spread)*0.8deg),#fff_calc(var(--spread)*1.2deg),#00000000_calc(var(--spread)*2deg))]",
              "before:content-[''] before:absolute before:inset-0 before:rounded-[inherit]",
              "before:bg-[radial-gradient(circle,oklch(from_var(--primary)_l_c_h_/_0.08)_0%,transparent_70%)]",
              "before:opacity-[calc(var(--active)*0.3)] before:transition-opacity before:duration-500",
              "before:blur-xl before:-z-10"
            )}
          />
        </div>
      </>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";
