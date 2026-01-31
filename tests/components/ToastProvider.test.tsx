import { render, screen } from "@testing-library/react";
import ToastProvider, { useToast } from "@/app/components/ToastProvider";

function ToastConsumer() {
  const toast = useToast();
  return (
    <button
      onClick={() => toast.push("Saved", "success")}
      type="button"
    >
      Trigger
    </button>
  );
}

describe("ToastProvider", () => {
  it("renders toasts", () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>
    );
    screen.getByText("Trigger").click();
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });
});
