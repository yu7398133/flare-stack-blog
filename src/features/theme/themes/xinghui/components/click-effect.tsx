import { useEffect, useRef, useCallback } from "react";
import { useRouteContext } from "@tanstack/react-router";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: "circle" | "heart";
}

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#818cf8",
  "#c084fc",
  "#f472b6",
  "#fb7185",
  "#e879f9",
];

export function ClickEffect() {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const enabled = siteConfig.theme.xinghui?.clickEffect ?? true;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
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

    particlesRef.current = particlesRef.current
      .map((p) => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.12,
        life: p.life - 1,
        size: p.size * 0.98,
      }))
      .filter((p) => p.life > 0);

    for (const p of particlesRef.current) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.size * 2;

      if (p.type === "heart") {
        drawHeart(ctx, p.x, p.y, p.size * 0.8);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    if (particlesRef.current.length > 0) {
      animRef.current = requestAnimationFrame(animate);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      const count = 12;
      for (let i = 0; i < count; i++) {
        counterRef.current++;
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        const speed = 2 + Math.random() * 4;
        const isHeart = Math.random() > 0.6;
        particlesRef.current.push({
          id: counterRef.current,
          x: e.clientX,
          y: e.clientY,
          size: isHeart ? 8 + Math.random() * 6 : 3 + Math.random() * 5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 40 + Math.random() * 30,
          maxLife: 40 + Math.random() * 30,
          type: isHeart ? "heart" : "circle",
        });
      }

      if (!animRef.current || particlesRef.current.length <= count) {
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

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  const s = size;
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(0, -s * 0.3, -s, -s * 0.3, -s, s * 0.1);
  ctx.bezierCurveTo(-s, s * 0.6, 0, s, 0, s * 1.2);
  ctx.bezierCurveTo(0, s, s, s * 0.6, s, s * 0.1);
  ctx.bezierCurveTo(s, -s * 0.3, 0, -s * 0.3, 0, s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
