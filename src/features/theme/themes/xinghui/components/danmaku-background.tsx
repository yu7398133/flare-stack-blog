import { useEffect, useRef, useState } from "react";

interface DanmakuItem {
  id: number;
  text: string;
  top: number;
  duration: number;
  delay: number;
  opacity: number;
}

const DEFAULT_TEXTS = [
  "Hello World ✨",
  "在代码的缝隙中寻找灵魂的共鸣",
  "记录每一个瞬间",
  "Keep coding, keep dreaming",
  "星光不负赶路人 🌟",
  "今天也要加油鸭",
  "Bug是暂时的，代码是永恒的",
  "调试中... 99%",
  "部署成功！🎉",
  "npm install happiness",
];

export function DanmakuBackground() {
  const [items, setItems] = useState<DanmakuItem[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    const generateItems = () => {
      const newItems: DanmakuItem[] = [];
      for (let i = 0; i < 8; i++) {
        counterRef.current++;
        newItems.push({
          id: counterRef.current,
          text: DEFAULT_TEXTS[Math.floor(Math.random() * DEFAULT_TEXTS.length)],
          top: 5 + Math.random() * 85,
          duration: 15 + Math.random() * 20,
          delay: Math.random() * 10,
          opacity: 0.15 + Math.random() * 0.2,
        });
      }
      return newItems;
    };

    setItems(generateItems());

    const interval = setInterval(() => {
      setItems((prev) => {
        const newItems = [...prev];
        // Replace a random item
        const replaceIdx = Math.floor(Math.random() * newItems.length);
        counterRef.current++;
        newItems[replaceIdx] = {
          id: counterRef.current,
          text:
            DEFAULT_TEXTS[
              Math.floor(Math.random() * DEFAULT_TEXTS.length)
            ],
          top: 5 + Math.random() * 85,
          duration: 15 + Math.random() * 20,
          delay: 0,
          opacity: 0.15 + Math.random() * 0.2,
        };
        return newItems;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute whitespace-nowrap text-xs font-mono text-slate-400 dark:text-slate-600 select-none xh-danmaku-item"
          style={{
            top: `${item.top}%`,
            opacity: item.opacity,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
