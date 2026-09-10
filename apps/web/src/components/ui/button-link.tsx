import * as React from "react";
import Link from "next/link";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@obsidian/ui";

export interface ButtonLinkProps extends Omit<React.ComponentProps<typeof Link>, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/**
 * A link that looks like a button. Keeps anchors as anchors so middle-click,
 * copy-link and prefetch all behave, instead of nesting an <a> in a <button>.
 */
export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, fullWidth, className)} {...props}>
      {children}
    </Link>
  );
}
