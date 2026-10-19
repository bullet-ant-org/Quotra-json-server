import { useEffect } from "react";

// Stops the page behind a modal/story from scrolling (incl. iOS rubber-banding).
export function useScrollLock() {
  useEffect(() => {
    const y = window.scrollY, b = document.body.style;
    const prev = { position: b.position, top: b.top, width: b.width, overflow: b.overflow };
    Object.assign(b, { position: "fixed", top: `-${y}px`, width: "100%", overflow: "hidden" });
    return () => { Object.assign(b, prev); window.scrollTo(0, y); };
  }, []);
}
