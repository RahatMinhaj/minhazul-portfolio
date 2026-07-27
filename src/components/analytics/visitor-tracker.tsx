"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SESSION_KEY = "portfolio-analytics-session";

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let sessionId = window.sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = window.crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    const controller = new AbortController();
    void fetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify({
        eventType: "PAGE_VIEW",
        pathname,
        referrer: document.referrer || null,
        sessionId,
      }),
      headers: { "content-type": "application/json" },
      keepalive: true,
      signal: controller.signal,
    });

    return () => controller.abort();
  }, [pathname]);

  return null;
}
