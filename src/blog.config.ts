import type { SiteConfig } from "@/features/config/site-config.schema";

export const blogConfig = {
  title: "XingHuiSamaの宝藏之地",
  author: "XingHuiSama",
  description:
    "在代码、学术与分子动力学模拟间穿梭的普通人。近期正埋头于 GROMACS 模拟研究与神经网络计算。",
  social: [
    { platform: "github", url: "https://github.com/heiehiehi" },
    { platform: "email", url: "mailto:xinghuisama@example.com" },
    { platform: "rss", url: "/rss.xml" },
  ],
  icons: {
    faviconSvg: "/favicon.svg",
    faviconIco: "/favicon.ico",
    favicon96: "/favicon-96x96.png",
    appleTouchIcon: "/apple-touch-icon.png",
    webApp192: "/web-app-manifest-192x192.png",
    webApp512: "/web-app-manifest-512x512.png",
  },
  theme: {
    default: {
      navBarName: "XingHuiSama",
    },
    fuwari: {
      homeBg: "https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg",
      avatar: "https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",
      primaryHue: 250,
    },
    xinghui: {
      homeBg: "https://www.loliapi.com/acg/pc/",
      avatar: "https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",
      musicIds: [] as string[],
      musicPlaylistIds: ["9157541613"],
      buildDate: "2026-01-01T00:00:00",
      danmakuList: [
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
      ] as string[],
      danmakuFontSize: 14,
      danmakuOpacity: 0.2,
    },
  },
} as const satisfies SiteConfig;
