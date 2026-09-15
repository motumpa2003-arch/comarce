"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./button-classes";
import { cn } from "./cn";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Render the child element instead of a <button>, keeping the styles. */
  asChild?: boolean;
  fullWidth?: boolean;
  /**
   * Label to briefly show (with a checkmark, plus a spring bounce) after
   * each click, before reverting on its own — e.g. "Added". Purely
   * decorative: the passed `onClick` still fires normally. Skipped under
   * reduced motion.
   */
  morphOnClick?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, fullWidth, morphOnClick, children, disabled, onClick, ...props },
  ref,
) {
  const [morphed, setMorphed] = React.useState(false);
  const reduceMotion = useReducedMotion();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (morphOnClick && !reduceMotion) {
      setMorphed(true);
      window.setTimeout(() => setMorphed(false), 900);
    }
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      animate={morphed ? { scale: [1, 0.94, 1.03, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={buttonClasses(variant, size, fullWidth, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80" />
        </span>
      )}
      <AnimatePresence mode="wait" initial={false}>
        {morphed && morphOnClick ? (
          <motion.span
            key="morph-success"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className={cn("inline-flex items-center gap-[inherit]", loading && "invisible")}
          >
            <Check className="h-4 w-4" />
            {morphOnClick}
          </motion.span>
        ) : (
          <motion.span
            key="morph-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("inline-flex items-center gap-[inherit]", loading && "invisible")}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
});
