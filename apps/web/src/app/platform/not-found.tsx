import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function PlatformNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="mb-5 grid h-14 w-14 place-items-center rounded-full border border-line bg-surface text-ink-muted">
        <PackageSearch className="h-6 w-6" />
      </span>
      <h1 className="font-display text-[19px] tracking-tight text-ink">That console page doesn&rsquo;t exist</h1>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-muted">
        The link may be out of date, or the tenant/record it points to may have been removed.
      </p>
      <Link
        href="/platform"
        className="mt-6 inline-flex h-10 items-center rounded-[var(--radius-button)] bg-primary px-5 text-[12px] font-medium text-inverse transition-colors hover:bg-primary-hover"
      >
        Back to platform home
      </Link>
    </div>
  );
}
