"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/app/lib/analytics";
import {
  COMPARE_STORAGE_KEY,
  MAX_COMPARE_PROFESSORS,
  type CompareProfessorItem
} from "@/app/lib/compare";
import CompareTray from "@/app/components/compare/CompareTray";

interface CompareContextValue {
  items: CompareProfessorItem[];
  isInCompare: (professorId: string) => boolean;
  addToCompare: (item: CompareProfessorItem, source?: string) => void;
  removeFromCompare: (professorId: string, source?: string) => void;
  clearCompare: () => void;
  maxItems: number;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}

export default function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareProfessorItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;
      const safeItems = parsed
        .filter((item): item is CompareProfessorItem => {
          return Boolean(item?.id && item?.name && item?.slug);
        })
        .slice(0, MAX_COMPARE_PROFESSORS);
      setItems(safeItems);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const isInCompare = (professorId: string) => items.some((item) => item.id === professorId);

  const addToCompare = (item: CompareProfessorItem, source = "unknown") => {
    setItems((prev) => {
      if (prev.some((existing) => existing.id === item.id)) return prev;
      if (prev.length >= MAX_COMPARE_PROFESSORS) return prev;
      trackEvent("compare_add", { professor_id: item.id, source, total_items: prev.length + 1 });
      return [...prev, item];
    });
  };

  const removeFromCompare = (professorId: string, source = "unknown") => {
    setItems((prev) => {
      if (!prev.some((item) => item.id === professorId)) return prev;
      const next = prev.filter((item) => item.id !== professorId);
      trackEvent("compare_remove", { professor_id: professorId, source, total_items: next.length });
      return next;
    });
  };

  const clearCompare = () => {
    setItems((prev) => {
      if (prev.length === 0) return prev;
      trackEvent("compare_remove", { professor_id: "all", source: "clear_all", total_items: 0 });
      return [];
    });
  };

  const value = useMemo<CompareContextValue>(
    () => ({
      items,
      isInCompare,
      addToCompare,
      removeFromCompare,
      clearCompare,
      maxItems: MAX_COMPARE_PROFESSORS
    }),
    [items]
  );

  return (
    <CompareContext.Provider value={value}>
      {children}
      <CompareTray />
    </CompareContext.Provider>
  );
}
