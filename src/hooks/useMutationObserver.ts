import { debounce, isEqual } from "lodash-es";
import { useEffect, useRef } from "react";
import useLatest from "./useLatest";

const DEFAULT_OPTIONS = {
  debounceTime: 0,
  config: {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
  } satisfies MutationObserverInit,
};

type Options = typeof DEFAULT_OPTIONS;

export default function useMutationObserver(
  targetEl: HTMLElement | null,
  cb: MutationCallback,
  options = DEFAULT_OPTIONS,
) {
  const observeRef = useRef<MutationObserver>(null);
  const optionsRef = useRef<Options>(null);
  const signalRen = useRef(0);
  const callbackRef = useLatest(cb);

  // 参数动态变化时，重新创建 MutationObserver
  if (!isEqual(options, optionsRef.current)) {
    signalRen.current += 1;
  }

  optionsRef.current = options;

  useEffect(() => {
    if (!targetEl) return;

    try {
      const { debounceTime, config } = optionsRef.current!;

      const mutationCallback: MutationCallback = (...args) => {
        callbackRef.current(...args);
      };

      observeRef.current = new MutationObserver(
        debounceTime > 0 ? debounce(mutationCallback, debounceTime) : mutationCallback,
      );
      observeRef.current.observe(targetEl, config);
    } catch (e) {
      console.error(e);
    }

    return () => {
      if (observeRef.current) {
        observeRef.current.disconnect();
        observeRef.current = null;
      }
    };
  }, [targetEl, callbackRef]);
}
