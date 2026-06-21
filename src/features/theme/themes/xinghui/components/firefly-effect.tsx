import { useEffect, useState, useRef } from "react";
import { useRouteContext } from "@tanstack/react-router";

interface Firefly {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocityX: number;
  velocityY: number;
  phase: number;
  speed: number;
}

export function FireflyEffect() {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const enabled = siteConfig.theme.xinghui?.fireflyEffect ?? true;
  const [fireflies, setFireflies] = useState<Firefly[]>([]);
  const animRef = useRef<number>(0);
  const counterRef = { current: 0 };

  useEffect(() => {
    if (!enabled) return;

    const count = 15;
    const initial: Firefly[] = [];
    for (let i = 0; i < count; i++) {
      counterRef.current++;
      initial.push({
        id: counterRef.current,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 3 + Math.random() * 4,
        opacity: 0,
        velocityX: (Math.random() - 0.5) * 0.5,
        velocityY: (Math.random() - 0.5) * 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02,
      });
    }
    setFireflies(initial);

    const animate = () => {
      setFireflies((prev) =>
        prev.map((f) => {
          const newPhase = f.phase + f.speed;
          const newOpacity = (Math.sin(newPhase) + 1) / 2 * 0.6;

          let newX = f.x + f.velocityX + Math.sin(newPhase * 0.7) * 0.3;
          let newY = f.y + f.velocityY + Math.cos(newPhase * 0.5) * 0.3;

          // Wrap around screen
          if (newX < -20) newX = window.innerWidth + 20;
          if (newX > window.innerWidth + 20) newX = -20;
          if (newY < -20) newY = window.innerHeight + 20;
          if (newY > window.innerHeight + 20) newY = -20;

          // Slight random drift
          const newVX = f.velocityX + (Math.random() - 0.5) * 0.02;
          const newVY = f.velocityY + (Math.random() - 0.5) * 0.02;

          return {
            ...f,
            x: newX,
            y: newY,
            opacity: newOpacity,
            phase: newPhase,
            velocityX: Math.max(-1, Math.min(1, newVX)),
            velocityY: Math.max(-1, Math.min(1, newVY)),
          };
        }),
      );
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {fireflies.map((f) => (
        <div
          key={f.id}
          className="absolute rounded-full"
          style={{
            left: f.x,
            top: f.y,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            backgroundColor: "#fbbf24",
            boxShadow: `0 0 ${f.size * 3}px ${f.size}px rgba(251, 191, 36, 0.4)`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
