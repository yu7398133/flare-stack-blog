import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useComments } from "@/features/comments/hooks/use-comments";
import {
  rootCommentsByPostIdInfiniteQuery,
  repliesByRootIdInfiniteQuery,
  COMMENTS_KEYS,
} from "@/features/comments/queries";
import { authClient } from "@/lib/auth/auth.client";
import { m } from "@/paraglide/messages";
import { renderCommentReact } from "@/components/common/comment-render";

interface CommentSectionProps {
  postId: number;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(rootCommentsByPostIdInfiniteQuery(postId, userId));

  const comments = commentsData?.pages.flatMap((p) => p.items) ?? [];
  const total = commentsData?.pages[0]?.total ?? 0;

  const [newComment, setNewComment] = useState("");
  const { createComment } = useComments(postId);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    if (!session) {
      toast.error(m.comments_toast_login_required());
      return;
    }
    try {
      await createComment({
        data: { postId, content: newComment },
      });
      setNewComment("");
      queryClient.invalidateQueries({
        queryKey: COMMENTS_KEYS.roots(postId),
      });
    } catch {}
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
        评论 ({total})
      </h3>

      {/* Comment input */}
      {session ? (
        <div className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下你的评论..."
            className="w-full bg-white/50 dark:bg-slate-700/50 border border-white/40 dark:border-white/10 rounded-xl p-4 text-sm text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            rows={3}
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            发表评论
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          请先<a href="/login" className="text-indigo-500 hover:underline">登录</a>后发表评论
        </p>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
      </div>

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-2 text-sm text-indigo-500 hover:text-indigo-600 transition-colors"
        >
          {isFetchingNextPage ? "加载中..." : "加载更多评论"}
        </button>
      )}

      {comments.length === 0 && (
        <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
          暂无评论，来抢沙发吧~
        </p>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  postId,
}: {
  comment: any;
  postId: number;
}) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const { data: repliesData, fetchNextPage, hasNextPage } = useInfiniteQuery(
    repliesByRootIdInfiniteQuery(postId, comment.id, userId),
  );
  const replies = repliesData?.pages.flatMap((p) => p.items) ?? [];
  const replyTotal = repliesData?.pages[0]?.total ?? 0;

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const { createComment } = useComments(postId);
  const queryClient = useQueryClient();

  const handleReply = async () => {
    if (!replyContent.trim() || !session) return;
    try {
      await createComment({
        data: {
          postId,
          content: replyContent,
          rootId: comment.id,
          replyToCommentId: comment.id,
        },
      });
      setReplyContent("");
      setShowReplyInput(false);
      queryClient.invalidateQueries({
        key: COMMENTS_KEYS.replies(postId, comment.id),
      });
    } catch {}
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-2xl bg-white/30 dark:bg-slate-700/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
          {comment.user?.name?.[0] || "?"}
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {comment.user?.name || "匿名用户"}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {formatDate(comment.createdAt)}
        </span>
      </div>

      <div className="text-sm text-slate-600 dark:text-slate-300 pl-10">
        {renderCommentReact(comment.content)}
      </div>

      <div className="flex items-center gap-3 pl-10">
        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="text-xs text-slate-400 hover:text-indigo-500 transition-colors"
        >
          回复
        </button>
        {replyTotal > 0 && (
          <span className="text-xs text-slate-400">
            {replyTotal} 条回复
          </span>
        )}
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="pl-8 space-y-3 border-l-2 border-slate-200/30 dark:border-slate-600/30 ml-4">
          {replies.map((reply: any) => (
            <div key={reply.id} className="rounded-xl bg-white/20 dark:bg-slate-700/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 text-[10px] font-bold">
                  {reply.user?.name?.[0] || "?"}
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {reply.user?.name || "匿名用户"}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {formatDate(reply.createdAt)}
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 pl-8">
                {renderCommentReact(reply.content)}
              </div>
            </div>
          ))}
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              className="text-xs text-indigo-500 hover:underline pl-3"
            >
              加载更多回复
            </button>
          )}
        </div>
      )}

      {/* Reply input */}
      {showReplyInput && session && (
        <div className="pl-8 space-y-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="写下你的回复..."
            className="w-full bg-white/30 dark:bg-slate-700/30 border border-white/30 dark:border-white/10 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleReply}
              disabled={!replyContent.trim()}
              className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-xs font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              回复
            </button>
            <button
              onClick={() => setShowReplyInput(false)}
              className="px-3 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
