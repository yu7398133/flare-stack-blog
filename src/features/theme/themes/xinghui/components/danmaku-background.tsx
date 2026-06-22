import { useEffect, useRef, useState } from "react";
import { useRouteContext } from "@tanstack/react-router";

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
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const [items, setItems] = useState<DanmakuItem[]>([]);
  const counterRef = useRef(0);

  const danmakuList =
    siteConfig.theme.xinghui?.danmakuList?.length > 0
      ? siteConfig.theme.xinghui.danmakuList
      : DEFAULT_TEXTS;
  const fontSize = siteConfig.theme.xinghui?.danmakuFontSize ?? 14;
  const opacity = siteConfig.theme.xinghui?.danmakuOpacity ?? 0.5;

  useEffect(() => {
    const generateItems = () => {
      const newItems: DanmakuItem[] = [];
      for (let i = 0; i < 8; i++) {
        counterRef.current++;
        newItems.push({
          id: counterRef.current,
          text: danmakuList[Math.floor(Math.random() * danmakuList.length)],
          top: 5 + Math.random() * 85,
          duration: 15 + Math.random() * 20,
          // 初始批次也从右侧开始，用负 delay 让它们已经在运动中
          delay: -(Math.random() * 15),
          opacity: opacity * (0.7 + Math.random() * 0.6),
        });
      }
      return newItems;
    };

    setItems(generateItems());

    const interval = setInterval(() => {
      setItems((prev) => {
        const newItems = [...prev];
        const replaceIdx = Math.floor(Math.random() * newItems.length);
        counterRef.current++;
        newItems[replaceIdx] = {
          id: counterRef.current,
          text: danmakuList[Math.floor(Math.random() * danmakuList.length)],
          top: 5 + Math.random() * 85,
          duration: 15 + Math.random() * 20,
          // 负 delay 让新弹幕从动画中间开始，不会从起点（右侧边缘）闪现
          delay: -(Math.random() * 10),
          opacity: opacity * (0.7 + Math.random() * 0.6),
        };
        return newItems;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [danmakuList, opacity]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute whitespace-nowrap text-slate-700/60 dark:text-slate-300/50 select-none xh-danmaku-item"
          style={{
            top: `${item.top}%`,
            opacity: item.opacity,
            fontSize: `${fontSize}px`,
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
