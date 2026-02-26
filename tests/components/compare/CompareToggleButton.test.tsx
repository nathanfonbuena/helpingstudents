import { fireEvent, render, screen } from "@testing-library/react";
import CompareProvider from "@/app/components/compare/CompareProvider";
import CompareToggleButton from "@/app/components/compare/CompareToggleButton";
import { trackEvent } from "@/app/lib/analytics";
import { COMPARE_STORAGE_KEY } from "@/app/lib/compare";

jest.mock("@/app/lib/analytics", () => ({
  trackEvent: jest.fn()
}));

describe("CompareToggleButton", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("adds and removes a professor from compare", () => {
    render(
      <CompareProvider>
        <CompareToggleButton
          professorId="prof-1"
          professorName="Dr. Test"
          professorSlug="dr-test"
          source="search"
        />
      </CompareProvider>
    );

    const addButton = screen.getByRole("button", { name: "Add compare" });
    fireEvent.click(addButton);

    expect(screen.getByRole("button", { name: "Remove compare" })).toBeInTheDocument();
    expect(screen.getByText(/Compare professors \(1\/3\)/)).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith(
      "compare_add",
      expect.objectContaining({ professor_id: "prof-1", source: "search" })
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove compare" }));
    expect(trackEvent).toHaveBeenCalledWith(
      "compare_remove",
      expect.objectContaining({ professor_id: "prof-1", source: "search" })
    );
  });

  it("hydrates compare tray from localStorage without clearing it on mount", async () => {
    window.localStorage.setItem(
      COMPARE_STORAGE_KEY,
      JSON.stringify([{ id: "prof-2", name: "Dr. Saved", slug: "dr-saved" }])
    );

    render(
      <CompareProvider>
        <div>Child</div>
      </CompareProvider>
    );

    expect(await screen.findByText(/Compare professors \(1\/3\)/)).toBeInTheDocument();
    expect(screen.getByText("Dr. Saved")).toBeInTheDocument();
    expect(window.localStorage.getItem(COMPARE_STORAGE_KEY)).toContain("dr-saved");
  });
});
