"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/app/lib/analytics";
import { useCompare } from "@/app/components/compare/CompareProvider";

export default function CompareTray() {
  const { items, removeFromCompare, clearCompare, maxItems } = useCompare();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const prevCountRef = useRef(items.length);

  // Auto-expand whenever a new professor is added so the action has visible feedback.
  useEffect(() => {
    if (items.length > prevCountRef.current) {
      setIsCollapsed(false);
    }
    prevCountRef.current = items.length;
  }, [items.length]);

  if (items.length === 0 || pathname === "/compare") return null;

  if (isCollapsed) {
    return (
      <aside className="compare-tray compare-tray--collapsed" aria-label="Professor compare tray">
        <button
          type="button"
          className="compare-tray__expand-btn"
          onClick={() => {
            setIsCollapsed(false);
            trackEvent("compare_tray_expand", { total_items: items.length });
          }}
        >
          Compare ({items.length}/{maxItems})
          <span className="compare-tray__chevron" aria-hidden="true">▴</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="compare-tray" aria-label="Professor compare tray">
      <div className="compare-tray__header">
        <strong>Compare professors ({items.length}/{maxItems})</strong>
        <div className="compare-tray__controls">
          <button type="button" className="compare-tray__clear" onClick={clearCompare}>
            Clear
          </button>
          <button
            type="button"
            className="compare-tray__minimize"
            aria-label="Minimize compare tray"
            onClick={() => {
              setIsCollapsed(true);
              trackEvent("compare_tray_collapse", { total_items: items.length });
            }}
          >
            ▾
          </button>
        </div>
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
