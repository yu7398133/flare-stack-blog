import { useEffect, useRef, useCallback } from "react";
import { useRouteContext } from "@tanstack/react-router";

interface Ripple {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
}

const RIPPLE_COLORS = [
  "rgba(99, 102, 241, 0.6)",   // indigo
  "rgba(139, 92, 246, 0.5)",   // violet
  "rgba(168, 85, 247, 0.4)",   // purple
];

export function ClickEffect() {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const enabled = siteConfig.theme.xinghui?.clickEffect ?? true;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const animRef = useRef<number>(0);
  const counterRef = useRef(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ripplesRef.current = ripplesRef.current
      .map((r) => ({
        ...r,
        radius: r.radius + (r.maxRadius - r.radius) * 0.08,
        life: r.life - 1,
      }))
      .filter((r) => r.life > 0);

    for (const r of ripplesRef.current) {
      const progress = 1 - r.life / r.maxLife;
      const alpha = 1 - progress;
      const lineWidth = 2 * (1 - progress * 0.5);

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = r.color.replace(/[\d.]+\)$/, `${alpha})`);
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Inner ring
      if (r.radius > 10) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = r.color.replace(/[\d.]+\)$/, `${alpha * 0.5})`);
        ctx.lineWidth = lineWidth * 0.6;
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;

    if (ripplesRef.current.length > 0) {
      animRef.current = requestAnimationFrame(animate);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      // Create 3 concentric ripples
      for (let i = 0; i < 3; i++) {
        counterRef.current++;
        ripplesRef.current.push({
          id: counterRef.current,
          x: e.clientX,
          y: e.clientY,
          radius: 5 + i * 8,
          maxRadius: 80 + i * 40,
          life: 50 + i * 15,
          maxLife: 50 + i * 15,
          color: RIPPLE_COLORS[i % RIPPLE_COLORS.length],
        });
      }

      if (!animRef.current || ripplesRef.current.length <= 3) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      cancelAnimationFrame(animRef.current);
    };
  }, [enabled, animate]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
