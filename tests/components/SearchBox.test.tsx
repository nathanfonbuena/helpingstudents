import { render, screen } from "@testing-library/react";
import SearchBox from "@/app/components/SearchBox";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() })
}));

describe("SearchBox", () => {
  it("renders input", () => {
    render(<SearchBox />);
    expect(screen.getByPlaceholderText(/Search by school or professor/i)).toBeInTheDocument();
  });
});
