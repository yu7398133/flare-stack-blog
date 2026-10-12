import { useQuery } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import { ArrowLeft, Edit3 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { PostPageProps } from "@/features/theme/contract/pages";
import { authClient } from "@/lib/auth/auth.client";
import { CommentSection } from "../../components/comment-section";
import { ContentRenderer } from "../../components/content/content-renderer";
import { SocialIcon } from "../../components/profile-card";

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Consistent image per post slug (same seed = same image as timeline)
import { getPostCover } from "../../utils/post-cover";

function getPostCoverLocal(slug: string, cover?: string | null) {
  return getPostCover(slug, cover, 1200, 600);
}

export function PostPage({ post }: PostPageProps) {
  const { data: session } = authClient.useSession();
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const activeId = useActiveTOC(post.toc);

  // Fetch recommended posts
  const { data: recommended } = useQuery({
    queryKey: ["recommended-posts", post.slug],
    queryFn: async () => {
      const res = await fetch(`/api/post/${post.slug}/related?limit=4`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const coverSrc = getPostCoverLocal(post.slug, post.cover);

  return (
    <div className="flex flex-col gap-6 xh-animate-in">
      {/* Back navigation */}
      <Link
        to="/posts"
        className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit"
      >
        <ArrowLeft size={12} />
        <span>返回上一级</span>
      </Link>

      {/* Main layout: article + sidebar */}
      <div className="flex gap-6 items-start">
        {/* Article */}
        <article className="flex-1 min-w-0 rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden transition-colors duration-700">
          {/* Cover image */}
          <div className="w-full aspect-video bg-slate-200 dark:bg-slate-700 relative group overflow-hidden">
            <img
              src={coverSrc}
              alt=""
              className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="p-6 md:p-10">
            {/* Title */}
            <h1 className="text-[2rem] font-bold text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {post.publishedAt && (
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold bg-white/30 dark:bg-slate-900/50 px-3 py-1.5 rounded-full text-xs shadow-sm border border-white/20 dark:border-white/5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatDate(post.publishedAt)}
                </span>
              )}
              {post.tags?.map((tag) => (
                <Link
                  key={tag.id}
                  to="/posts"
                  search={{ tagName: tag.name }}
                  className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-bold bg-white/30 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-full text-xs shadow-sm border border-white/20 dark:border-white/5 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                >
                  <span className="opacity-70">#</span> {tag.name}
                </Link>
              ))}
              {session?.user.role === "admin" && (
                <Link
                  to="/admin/posts/edit/$id"
                  params={{ id: String(post.id) }}
                  className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors text-xs"
                >
                  <Edit3 size={12} />
                  <span>编辑</span>
                </Link>
              )}
            </div>

            {/* Content */}
            <div className="xh-prose prose prose-slate dark:prose-invert prose-base md:prose-lg max-w-none">
              <ContentRenderer content={post.contentJson} />
            </div>

            {/* End marker */}
            <div className="my-8 flex items-center justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/30 dark:via-slate-600/30 to-transparent" />
              <span className="mx-4 text-sm font-mono tracking-widest text-slate-400 dark:text-slate-500 opacity-50">
                END
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-300/30 dark:from-slate-600/30 via-transparent to-transparent" />
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-5 w-64 shrink-0 self-start">
          {/* Author card */}
          <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md mb-3 transition-transform duration-500 hover:rotate-3">
              <img
                src={siteConfig.theme.xinghui?.avatar || "/images/avatar.png"}
                alt="avatar"
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {siteConfig.author}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              {siteConfig.social?.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-md bg-white/50 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-white/80 dark:hover:bg-white/20 transition-all border border-white/20 dark:border-white/5"
                  title={link.platform}
                >
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          </div>

          {/* Recommended posts */}
          {recommended && recommended.length > 0 && (
            <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5">
              <h3 className="font-black text-slate-900 dark:text-white mb-3 border-l-4 border-indigo-500 pl-2 text-sm uppercase tracking-widest">
                推荐阅读
              </h3>
              <div className="space-y-3">
                {recommended.map(
                  (r: {
                    slug: string;
                    title: string;
                    publishedAt?: string;
                  }) => (
                    <Link
                      key={r.slug}
                      to="/post/$slug"
                      params={{ slug: r.slug }}
                      className="group block"
                    >
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {r.title}
                      </h4>
                      {r.publishedAt && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                          {formatDate(r.publishedAt)}
                        </p>
                      )}
                    </Link>
                  ),
                )}
              </div>
            </div>
          )}

          {/* TOC */}
          {post.toc && post.toc.length > 0 && (
            <TocCard activeId={activeId}>
              <h3 className="shrink-0 font-black text-slate-900 dark:text-white mb-3 border-l-4 border-indigo-500 pl-2 text-sm uppercase tracking-widest">
                目录
              </h3>
              <nav
                data-toc-list
                className="flex flex-col overflow-y-auto overscroll-contain xh-scrollbar"
              >
                {post.toc.map((item) => (
                  <a
                    key={item.id}
                    data-toc-id={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(item.id);
                      if (!el) return;
                      const navbarH = 64;
                      const y =
                        el.getBoundingClientRect().top +
                        window.scrollY -
                        navbarH -
                        16;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }}
                    className={`block text-[0.8rem] py-1 border-l-[1.5px] transition-all duration-300 leading-relaxed ${
                      item.level <= 2
                        ? "pl-3"
                        : item.level === 3
                          ? "pl-[1.9rem]"
                          : "pl-[2.7rem]"
                    } ${
                      activeId === item.id
                        ? "text-indigo-600 dark:text-indigo-400 border-indigo-500 font-medium"
                        : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </TocCard>
          )}
        </aside>
      </div>

      {/* Comments */}
      <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 xh-animate-in">
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}

/**
 * Table of contents card with three scroll behaviours:
 *  1. The card is pinned to the middle of the page and stays put: its own
 *     centre is aligned with the viewport's centre, and it does not move as
 *     the article scrolls. It is deliberately independent of the cards above
 *     it, which scroll away as normal.
 *  2. The heading is fixed and the list scrolls on its own, capped at
 *     two thirds of the viewport; wheel over the list scrolls it, and at
 *     either end the wheel is released so the page keeps scrolling.
 *  3. The entry for the section being read is highlighted and scrolled into
 *     view, so a long list follows the reader through the article.
 */
function TocCard({
  children,
  activeId,
}: {
  children: ReactNode;
  activeId?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sidebar = el.parentElement;
    if (!sidebar) return;

    // Keeps the card's slot in the sidebar while the card itself is fixed.
    const placeholder = document.createElement("div");
    placeholder.setAttribute("aria-hidden", "true");
    sidebar.insertBefore(placeholder, el);

    // Scroll logic 1 — the card is pinned to the middle of the page.
    //
    // It is taken out of flow with position: fixed and anchored so its own
    // centre lands on the viewport's centre. Being fixed, it is unaffected by
    // the cards above it (which scroll away as normal) and by how far the
    // article has been scrolled, so it stays visible throughout.
    //
    // The sidebar itself is hidden below Tailwind's `lg` breakpoint, and fixed
    // positioning ignores a hidden ancestor, so the card has to stand itself
    // down on narrow screens or it would float over the article.
    const isWide = () => window.innerWidth >= 1024;

    const layout = () => {
      if (!isWide()) {
        el.style.position = "";
        el.style.left = "";
        el.style.width = "";
        el.style.top = "";
        placeholder.style.height = "";
        return;
      }

      const box = sidebar.getBoundingClientRect();
      const height = el.offsetHeight;

      // Hold the card's place in the column: fixed positioning takes it out of
      // flow, which would otherwise collapse the space reserved for it.
      placeholder.style.height = `${height}px`;

      el.style.position = "fixed";
      el.style.left = `${box.left}px`;
      el.style.width = `${box.width}px`;
      el.style.top = `${Math.max(8, (window.innerHeight - height) / 2)}px`;
    };

    // Cap the list at two thirds of the viewport, minus the heading, so a long
    // table of contents scrolls inside the card rather than overrunning it.
    const sizeList = () => {
      if (!isWide()) return;
      const list = el.querySelector<HTMLElement>("[data-toc-list]");
      if (!list) return;
      list.style.maxHeight = "";
      const headingHeight = el.offsetHeight - list.offsetHeight;
      const room = window.innerHeight * (2 / 3) - headingHeight;
      list.style.maxHeight = `${Math.round(Math.max(120, room))}px`;
    };

    const onResize = () => {
      sizeList();
      layout();
    };

    sizeList();
    layout();
    window.addEventListener("resize", onResize);

    // The cards above the TOC fill in asynchronously (the recommended list is
    // fetched after mount), and the list height depends on its own content, so
    // re-run whenever anything in the sidebar or the card changes size.
    const observer = new ResizeObserver(onResize);
    observer.observe(sidebar);
    observer.observe(el);
    for (const card of sidebar.children) observer.observe(card);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      placeholder.remove();
    };
  }, []);

  // Scroll logic 2: the wheel over the card scrolls the card's own list; at
  // either end the event falls through so the page keeps scrolling naturally.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const list = el.querySelector<HTMLElement>("[data-toc-list]");
    if (!list) return;

    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = list;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
      const scrollingUp = e.deltaY < 0;

      // Release the wheel to the page at either end of the list.
      if ((scrollingUp && atTop) || (!scrollingUp && atBottom)) return;

      e.preventDefault();
      list.scrollTop += e.deltaY;
    };

    // passive: false so preventDefault() is allowed.
    list.addEventListener("wheel", onWheel, { passive: false });
    return () => list.removeEventListener("wheel", onWheel);
  }, [children]);

  // Scroll logic 3: the list follows the reader. The active entry is
  // highlighted, and when it would leave the list's visible area the list
  // scrolls itself to bring it back, so a long table of contents always shows
  // where the reader currently is.
  useEffect(() => {
    const el = ref.current;
    if (!el || !activeId) return;
    const list = el.querySelector<HTMLElement>("[data-toc-list]");
    if (!list) return;

    const active = list.querySelector<HTMLElement>(
      `[data-toc-id="${CSS.escape(activeId)}"]`,
    );
    if (!active) return;

    const listBox = list.getBoundingClientRect();
    const itemBox = active.getBoundingClientRect();

    // Already comfortably visible — leave the scroll position alone.
    const inset = 8;
    if (
      itemBox.top >= listBox.top + inset &&
      itemBox.bottom <= listBox.bottom - inset
    ) {
      return;
    }

    // Centre the active entry within the list.
    const target =
      active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2;
    list.scrollTo({
      top: Math.max(0, target),
      behavior: "smooth",
    });
  }, [activeId]);

  return (
    <div
      ref={ref}
      className="z-10 flex flex-col rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-4"
    >
      {children}
    </div>
  );
}

function useActiveTOC(
  toc?: Array<{ id: string; level: number; text: string }>,
) {
  const [activeId, setActiveId] = useState("");
  useEffect(() => {
    if (!toc?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveId(e.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );
    for (const item of toc) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [toc]);
  return activeId;
}
