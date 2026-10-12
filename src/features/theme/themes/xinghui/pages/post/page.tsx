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
              <h3 className="font-black text-slate-900 dark:text-white mb-3 border-l-4 border-indigo-500 pl-2 text-sm uppercase tracking-widest">
                目录
              </h3>
              <nav className="flex flex-col">
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
                    className={`block text-sm py-1 border-l-[1.5px] transition-all duration-300 leading-relaxed ${
                      activeId === item.id
                        ? "text-indigo-600 dark:text-indigo-400 border-indigo-500 font-medium pl-3"
                        : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300 pl-3 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                    style={{
                      marginLeft: `${(item.level - 2) * 0.75}rem`,
                    }}
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
 *  1. It travels with the page while the article scrolls, and comes to rest
 *     under the cards above it; once the sidebar scrolls on it travels away
 *     too, instead of being pinned and clipped.
 *  2. Wheel over the card scrolls the card's own list; when the list hits an
 *     edge the wheel is released so the page keeps scrolling naturally.
 *  3. The entry for the section being read is kept in view, so a long list
 *     follows along as the article moves through its headings.
 */
const NAVBAR_OFFSET = 96; // sticky top-24 + breathing room
const SIDEBAR_GAP = 20; // matches the aside's gap-5

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

    let frame = 0;

    // Scroll logic 1 — the card rides with the page beneath the other sidebar
    // cards, then stops following and scrolls away with the rest of the column.
    //
    // The list has no height cap, so the card is always fully readable. It is
    // held below the cards above it by a sticky offset equal to their height:
    // the card can rise no further than its own slot, and once those cards
    // have left the viewport it simply travels on with the page like any other
    // element — no pinning, no clipping.
    const updateStickyTop = () => {
      frame = 0;
      const cards = Array.from(sidebar.children).filter(
        (c) => c !== el,
      ) as HTMLElement[];
      // Everything stacked above the TOC inside the sidebar.
      const above =
        cards.reduce((sum, c) => sum + c.offsetHeight, 0) +
        cards.length * SIDEBAR_GAP;

      // No height cap: the card is as tall as its list needs.
      el.style.maxHeight = "";

      // The offset keeps the card in its slot: it may rise only as far as the
      // content above it, so it can never pin over the article.
      el.style.top = `${above + NAVBAR_OFFSET}px`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateStickyTop);
    };

    updateStickyTop();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Scroll logic 2: the wheel over the card scrolls the card's own list; at
  // either end the event falls through so the page keeps scrolling naturally.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
      const scrollingUp = e.deltaY < 0;

      // Release the wheel to the page at either end of the list.
      if ((scrollingUp && atTop) || (!scrollingUp && atBottom)) return;

      e.preventDefault();
      el.scrollTop += e.deltaY;
    };

    // passive: false so preventDefault() is allowed.
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [children]);

  // Scroll logic 3: while the other sidebar cards are still on screen the
  // list follows the reader — if the entry for the current section would leave
  // the visible area, the list scrolls itself to bring it back.
  //
  // Once those cards have scrolled away the list stops following: from then on
  // it moves with the page like the rest of the sidebar, so the reader is
  // never fighting the list for scroll position.
  useEffect(() => {
    const el = ref.current;
    if (!el || !activeId) return;
    const sidebar = el.parentElement;
    if (!sidebar) return;

    const previousCards = Array.from(sidebar.children).filter(
      (c) => c !== el,
    ) as HTMLElement[];

    // The other cards are gone once the last of them has left the viewport.
    const othersGone = previousCards.every(
      (card) => card.getBoundingClientRect().bottom <= 0,
    );
    if (othersGone) return;

    const active = el.querySelector<HTMLElement>(
      `[data-toc-id="${CSS.escape(activeId)}"]`,
    );
    if (!active) return;

    const cardBox = el.getBoundingClientRect();
    const itemBox = active.getBoundingClientRect();

    // Already comfortably visible — leave the scroll position alone.
    const inset = 8;
    if (
      itemBox.top >= cardBox.top + inset &&
      itemBox.bottom <= cardBox.bottom - inset
    ) {
      return;
    }

    // Centre the active entry within the list.
    const target =
      active.offsetTop - el.clientHeight / 2 + active.clientHeight / 2;
    el.scrollTo({
      top: Math.max(0, target),
      behavior: "smooth",
    });
  }, [activeId]);

  return (
    <div
      ref={ref}
      className="sticky top-24 z-10 rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-4 overflow-y-auto overscroll-contain xh-scrollbar"
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
