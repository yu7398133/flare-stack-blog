import { useEffect, useRef, useCallback } from "react";
import { useRouteContext } from "@tanstack/react-router";

interface Firefly {
  id: number;
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
  hue: number;
}

export function FireflyEffect() {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const enabled = siteConfig.theme.xinghui?.fireflyEffect ?? true;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firefliesRef = useRef<Firefly[]>([]);
  const animRef = useRef<number>(0);

  const initFireflies = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const count = Math.floor((w * h) / 40000); // density-based
    const flies: Firefly[] = [];
    for (let i = 0; i < Math.max(count, 20); i++) {
      flies.push({
        id: i,
        x: Math.random() * w,
        y: Math.random() * h,
        size: 2 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.015,
        hue: 40 + Math.random() * 30, // amber to yellow-green
      });
    }
    firefliesRef.current = flies;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    for (const f of firefliesRef.current) {
      f.phase += f.speed;
      const opacity = ((Math.sin(f.phase) + 1) / 2) * 0.7;

      f.x += f.vx + Math.sin(f.phase * 0.7) * 0.3;
      f.y += f.vy + Math.cos(f.phase * 0.5) * 0.3;

      // Wrap around
      if (f.x < -20) f.x = w + 20;
      if (f.x > w + 20) f.x = -20;
      if (f.y < -20) f.y = h + 20;
      if (f.y > h + 20) f.y = -20;

      // Drift
      f.vx += (Math.random() - 0.5) * 0.01;
      f.vy += (Math.random() - 0.5) * 0.01;
      f.vx = Math.max(-0.8, Math.min(0.8, f.vx));
      f.vy = Math.max(-0.8, Math.min(0.8, f.vy));

      // Draw glow
      const glowSize = f.size * 4;
      const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowSize);
      gradient.addColorStop(0, `hsla(${f.hue}, 90%, 70%, ${opacity})`);
      gradient.addColorStop(0.4, `hsla(${f.hue}, 85%, 60%, ${opacity * 0.5})`);
      gradient.addColorStop(1, `hsla(${f.hue}, 80%, 50%, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(f.x, f.y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw core
      ctx.fillStyle = `hsla(${f.hue}, 95%, 80%, ${opacity})`;
      ctx.shadowColor = `hsla(${f.hue}, 90%, 70%, 0.8)`;
      ctx.shadowBlur = f.size * 3;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    initFireflies();
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [enabled, initFireflies, animate]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
