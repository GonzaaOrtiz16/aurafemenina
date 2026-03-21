import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackAnalyticsEvent } from "@/lib/analytics";

function getElementLabel(element: HTMLElement) {
  const explicit = element.dataset.trackKey;
  if (explicit) return explicit.slice(0, 120);

  const aria = element.getAttribute("aria-label");
  if (aria) return aria.slice(0, 120);

  const text = element.textContent?.replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 120);

  if (element instanceof HTMLAnchorElement && element.getAttribute("href")) {
    return `link:${element.getAttribute("href")}`.slice(0, 120);
  }

  return element.tagName.toLowerCase();
}

export default function AnalyticsTracker() {
  const location = useLocation();
  const trackedDepths = useRef<Set<number>>(new Set());

  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  useEffect(() => {
    trackedDepths.current = new Set();

    void trackAnalyticsEvent({
      eventType: "page_view",
      path: currentPath,
      metadata: {
        search: location.search || "",
      },
    });
  }, [currentPath, location.search]);

  useEffect(() => {
    const thresholds = [25, 50, 75, 90];

    const handleScroll = () => {
      const scrollableHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const depth = Math.round((window.scrollY / scrollableHeight) * 100);

      thresholds.forEach((threshold) => {
        if (depth >= threshold && !trackedDepths.current.has(threshold)) {
          trackedDepths.current.add(threshold);
          void trackAnalyticsEvent({
            eventType: "scroll_depth",
            path: currentPath,
            metadata: { depth: threshold },
          });
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPath]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest<HTMLElement>("[data-track-key], a, button, [role='button']");
      if (!interactive) return;

      const xPercent = (event.clientX / window.innerWidth) * 100;
      const yPercent = (event.clientY / window.innerHeight) * 100;

      void trackAnalyticsEvent({
        eventType: "click",
        path: currentPath,
        elementKey: getElementLabel(interactive),
        productId: interactive.dataset.productId,
        customProductId: interactive.dataset.customProductId,
        xPercent,
        yPercent,
        metadata: {
          tag: interactive.tagName.toLowerCase(),
          href: interactive instanceof HTMLAnchorElement ? interactive.getAttribute("href") : null,
        },
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [currentPath]);

  return null;
}
