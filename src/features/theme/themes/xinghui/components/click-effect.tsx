import { useEffect, useState } from "react";
import { useRouteContext } from "@tanstack/react-router";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocityX: number;
  velocityY: number;
  life: number;
}

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a78bfa", // purple-light
  "#818cf8", // indigo-light
  "#c084fc", // fuchsia
  "#f472b6", // pink
];

export function ClickEffect() {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const enabled = siteConfig.theme.xinghui?.clickEffect ?? true;
  const [particles, setParticles] = useState<Particle[]>([]);
  const counterRef = { current: 0 };

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 8; i++) {
        counterRef.current++;
        const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
        const speed = 2 + Math.random() * 3;
        newParticles.push({
          id: counterRef.current,
          x: e.clientX,
          y: e.clientY,
          size: 4 + Math.random() * 6,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          velocityX: Math.cos(angle) * speed,
          velocityY: Math.sin(angle) * speed,
          life: 1,
        });
      }
      setParticles((prev) => [...prev, ...newParticles]);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [enabled]);

  useEffect(() => {
    if (particles.length === 0) return;
    const timer = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.velocityX,
            y: p.y + p.velocityY,
            velocityY: p.velocityY + 0.15,
            life: p.life - 0.03,
            size: p.size * 0.97,
          }))
          .filter((p) => p.life > 0),
      );
    });
    return () => cancelAnimationFrame(timer);
  }, [particles]);

  if (!enabled || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.life,
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}
