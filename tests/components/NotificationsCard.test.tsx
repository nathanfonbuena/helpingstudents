import { render, screen } from "@testing-library/react";
import NotificationsCard from "@/app/components/account/NotificationsCard";
import notifications from "@/tests/fixtures/notifications.json";

describe("NotificationsCard", () => {
  it("renders empty state", () => {
    render(<NotificationsCard notifications={[]} />);
    expect(screen.getByText(/No notifications yet/)).toBeInTheDocument();
  });

  it("renders notifications", () => {
    render(
      <NotificationsCard
        notifications={notifications.map((item) => ({
          id: item.id,
          type: item.type as "new_review" | "new_material" | "ranking_change",
          message: item.message,
          destination: item.destination,
          createdAt: new Date()
        }))}
      />
    );
    expect(screen.getByText(/New materials/i)).toBeInTheDocument();
    expect(screen.getByText(/New reviews/i)).toBeInTheDocument();
    expect(screen.getByText(/New upload/)).toBeInTheDocument();
  });
});
