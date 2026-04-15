"use client";

import { useState, useEffect } from "react";

/**
 * Feature flag hook — reads from URL params (?ff_<flag>=1|0) and persists to localStorage.
 * Not exposed in UI; only settable via URL. E.g. ?ff_recipes=1 to enable.
 */
export function useFeatureFlag(flag: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlValue = params.get(`ff_${flag}`);

    if (urlValue !== null) {
      const isEnabled = urlValue === "1" || urlValue === "true";
      localStorage.setItem(`potlucky-ff-${flag}`, isEnabled ? "1" : "0");
      setEnabled(isEnabled);

      // Strip the param from URL so it's not visible / shareable
      params.delete(`ff_${flag}`);
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
      return;
    }

    // Fall back to localStorage
    const stored = localStorage.getItem(`potlucky-ff-${flag}`);
    setEnabled(stored === "1");
  }, [flag]);

  return enabled;
}
