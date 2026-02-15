"use client";

import { useCompare } from "@/app/components/compare/CompareProvider";

interface CompareToggleButtonProps {
  professorId: string;
  professorName: string;
  professorSlug: string;
  source: "search" | "rankings" | "profile";
  className?: string;
}

export default function CompareToggleButton({
  professorId,
  professorName,
  professorSlug,
  source,
  className
}: CompareToggleButtonProps) {
  const { isInCompare, addToCompare, removeFromCompare, items, maxItems } = useCompare();
  const selected = isInCompare(professorId);
  const atLimit = items.length >= maxItems;
  const disabled = !selected && atLimit;

  return (
    <button
      type="button"
      className={className ?? "btn btn--ghost btn--sm"}
      disabled={disabled}
      title={disabled ? `You can compare up to ${maxItems} professors.` : undefined}
      onClick={() => {
        if (selected) {
          removeFromCompare(professorId, source);
          return;
        }
        addToCompare(
          {
            id: professorId,
            name: professorName,
            slug: professorSlug
          },
          source
        );
      }}
    >
      {selected ? "Remove compare" : "Add compare"}
    </button>
  );
}
