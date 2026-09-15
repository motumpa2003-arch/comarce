import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { SavedSearchList } from "@/components/account/saved-search-list";

export const metadata: Metadata = { title: "Saved searches" };

export default function SavedSearchesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2.5 font-display display-case text-[26px] leading-none text-ink">
          <Bookmark className="h-5 w-5 text-accent" />
          Saved searches
        </h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Searches you have run recently, ready to re-open with the same filters. Kept in this browser, never sent to
          us.
        </p>
      </div>

      <SavedSearchList />
    </div>
  );
}
