import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@obsidian/ui";

export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-[11.5px]">
          {breadcrumbs.map((crumb, index) => {
            const last = index === breadcrumbs.length - 1;
            return (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {crumb.href && !last ? (
                  <Link href={crumb.href} className="text-ink-muted transition-colors hover:text-ink">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={last ? "text-ink" : "text-ink-muted"}>{crumb.label}</span>
                )}
                {!last && <ChevronRight className="h-3 w-3 text-ink-muted/60" />}
              </span>
            );
          })}
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-ink">{title}</h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
