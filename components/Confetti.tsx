"use client";

import { useEffect, useRef } from "react";

interface ConfettiProps {
  active: boolean;
}

const COLORS = ["#f97316", "#16a34a", "#3b82f6", "#eab308", "#ec4899", "#8b5cf6", "#06b6d4"];

export default function Confetti({ active }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Spawn 120 particles from center-top
    particles.current = Array.from({ length: 120 }, (_, i) => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: 0,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 6 + 2,
      size: Math.random() * 8 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 8,
      gravity: 0.18 + Math.random() * 0.1,
      opacity: 1,
    }));

    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      particles.current = particles.current.filter((p) => p.opacity > 0.02);

      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.angle += p.spin;
        if (frame > 60) p.opacity -= 0.012;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });

      if (particles.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-20 rounded-2xl"
    />
  );
}
