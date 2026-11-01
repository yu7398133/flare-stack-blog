// 背景图源（loliapi 一类随机端点）单张图会 404，且整体挂掉时不能变成请求风暴，
// 所以重试策略抽成纯函数放在这里，由 hook 与测试共享同一份判定。

export const HOME_BG_MAX_RETRIES = 3;

export interface HomeBgFailureInput {
  failures: number;
  totalRetries: number;
  isRandom: boolean;
}

export type HomeBgFailureAction =
  | { kind: "retry"; nextFailures: number; totalRetries: number }
  | { kind: "giveUp"; nextFailures: number; totalRetries: number };

// 静态图失败不重试：路径固定，再请求还是同一个坏 URL，只会白打一次。
export function resolveHomeBgFailure(
  input: HomeBgFailureInput,
): HomeBgFailureAction {
  const nextFailures = input.failures + 1;
  if (!input.isRandom || nextFailures > HOME_BG_MAX_RETRIES) {
    return {
      kind: "giveUp",
      nextFailures,
      totalRetries: input.totalRetries,
    };
  }
  return {
    kind: "retry",
    nextFailures,
    totalRetries: input.totalRetries + 1,
  };
}

// 用 _t 参数破缓存：不加的话浏览器会命中同一个失败响应，重试等于没试。
export function withCacheBuster(base: string, stamp: number): string {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}_t=${stamp}`;
}
