import { render, screen } from "@testing-library/react";
import Sidebar from "@/app/components/Sidebar";

jest.mock("next-auth/react", () => ({
  useSession: () => ({ status: "unauthenticated" })
}));

describe("Sidebar", () => {
  it("shows login buttons when unauthenticated", () => {
    render(<Sidebar />);
    expect(screen.getByText(/Sign up/)).toBeInTheDocument();
    expect(screen.getByText(/Log in/)).toBeInTheDocument();
  });
});
