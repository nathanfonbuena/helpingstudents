"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/app/lib/analytics";
import { useCompare } from "@/app/components/compare/CompareProvider";

export default function CompareTray() {
  const { items, removeFromCompare, clearCompare, maxItems } = useCompare();
  const pathname = usePathname();

  if (items.length === 0 || pathname === "/compare") return null;

  return (
    <aside className="compare-tray" aria-label="Professor compare tray">
      <div className="compare-tray__header">
        <strong>
          Compare professors ({items.length}/{maxItems})
        </strong>
        <button type="button" className="compare-tray__clear" onClick={clearCompare}>
          Clear
        </button>
      </div>
      <div className="compare-tray__items">
        {items.map((item) => (
          <span key={item.id} className="compare-tray__item">
            {item.name}
            <button
              type="button"
              aria-label={`Remove ${item.name} from compare`}
              onClick={() => removeFromCompare(item.id, "tray")}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <Link
        className="btn btn--primary btn--sm compare-tray__view"
        href="/compare"
        onClick={() => trackEvent("compare_view_open", { source: "tray", total_items: items.length })}
      >
        Compare now
      </Link>
    </aside>
  );
}
