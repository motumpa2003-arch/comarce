"use client";

import { motion } from "framer-motion";
import { cn } from "./cn";

/**
 * The animated inner bar for `Progress`. Split into its own "use client"
 * file so `Progress` itself (and the rest of surface.tsx) stays safe to
 * render from Server Components — framer-motion's `motion.*` components
 * only work inside a client boundary.
 */
export function ProgressFill({ width, className }: { width: string; className?: string }) {
  return (
    <motion.div
      initial={false}
      animate={{ width }}
      transition={{ type: "spring", stiffness: 140, damping: 22 }}
      className={cn("h-full rounded-full", className)}
    />
  );
}
