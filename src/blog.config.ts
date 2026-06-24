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
    xinghui: {
      homeBg: "https://www.loliapi.com/acg/pc/",
      avatar: "https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",
      aboutContent: "我不是那种点几下鼠标就觉得自己懂技术的人。我是真正动手的那一类——NAS 自己搭、Docker 自己编排、OpenWrt 路由器自己调、IPTV 组播自己抓包、博客自己写 MCP 扩展。什么都折腾，但从不瞎折腾。\n\n我极度务实。踩过的坑一定记下来，记下来就一定复用。不是写给别人看的，是为了下次不摔同一个地方。\n\n我对自己用什么工具很清楚。什么时候该自己干，什么时候该交给专业的人，从来不跨界瞎指挥。\n\n我话不多，但信息密度很高。三行能说清楚的事，绝不用五段。对成品质量有要求——不是什么\"能用就行\"。\n\n不爱废话，不接受假话。能做就是能做，不能做就是不能做。\n\n技术过硬、目标明确、务实到底。不折腾人，就折腾机器。",
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
      clickEffect: true,
      fireflyEffect: true,
    },
  },
} as const satisfies SiteConfig;
