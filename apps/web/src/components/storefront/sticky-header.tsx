"use client";

import * as React from "react";
import { cn } from "@obsidian/ui";

/**
 * Sticks the header once the announcement bar scrolls away, and hides it on
 * downward scroll past the fold so long product pages get their space back.
 */
export function StickyHeader({ children }: { children: React.ReactNode }) {
  const [stuck, setStuck] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const lastY = React.useRef(0);

  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setStuck(y > 40);
      setHidden(y > 340 && y > lastY.current + 4);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "sticky top-0 z-50 transition-[transform,box-shadow] duration-300 ease-out",
        stuck && "shadow-lg",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      {children}
    </div>
  );
}
