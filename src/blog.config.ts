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
      musicIds: ["1809646618", "3361076230", "1859390262"],
      buildDate: "2026-01-01T00:00:00",
    },
  },
} as const satisfies SiteConfig;
