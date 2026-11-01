import { useCallback, useEffect, useRef, useState } from "react";
import { isRandomImageEndpoint } from "@/features/theme/site-config.helpers";
import { resolveHomeBgFailure, withCacheBuster } from "./home-bg-retry";

export interface HomeBgState {
  url: string | undefined;
  // 重试用尽或静态图失败后置 true：渲染层据此退到纯色渐变，而不是留一块空白
  degraded: boolean;
  onError: () => void;
  onLoad: () => void;
  refresh: () => void;
}

export function useHomeBg(base: string | undefined): HomeBgState {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [degraded, setDegraded] = useState(false);
  const failuresRef = useRef(0);
  const retriesRef = useRef(0);
  const isRandom = !!base && isRandomImageEndpoint(base);

  useEffect(() => {
    failuresRef.current = 0;
    retriesRef.current = 0;
    setDegraded(false);
    setUrl(base ? withCacheBuster(base, Date.now()) : undefined);
  }, [base]);

  const onError = useCallback(() => {
    if (!base) return;
    const action = resolveHomeBgFailure({
      failures: failuresRef.current,
      totalRetries: retriesRef.current,
      isRandom,
    });
    failuresRef.current = action.nextFailures;
    retriesRef.current = action.totalRetries;
    if (action.kind === "giveUp") {
      setDegraded(true);
      setUrl(undefined);
      return;
    }
    setUrl(withCacheBuster(base, Date.now() + action.nextFailures));
  }, [base, isRandom]);

  const onLoad = useCallback(() => {
    failuresRef.current = 0;
    setDegraded(false);
  }, []);

  // 手动换图：重置降级与计数，给用户一条自救路径
  const refresh = useCallback(() => {
    if (!base) return;
    failuresRef.current = 0;
    setDegraded(false);
    setUrl(withCacheBuster(base, Date.now()));
  }, [base]);

  return { url, degraded, onError, onLoad, refresh };
}
