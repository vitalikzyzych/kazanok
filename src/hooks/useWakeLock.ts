import { useEffect } from "react";

/** Keeps the screen on while a recipe is open (where the browser allows it). */
export const useWakeLock = (active: boolean) => {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = () => {
      if (document.visibilityState !== "visible" || lock) return;
      navigator.wakeLock
        .request("screen")
        .then((l) => {
          if (cancelled) {
            void l.release();
            return;
          }
          lock = l;
          l.addEventListener("release", () => {
            lock = null;
          });
        })
        .catch(() => {
          // Low battery mode or no permission: the screen may dim.
        });
    };

    request();
    // The browser releases the lock when the tab is hidden.
    document.addEventListener("visibilitychange", request);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", request);
      void lock?.release();
    };
  }, [active]);
};
