import { render, screen, fireEvent } from "@testing-library/react";
import FollowButton from "@/app/components/FollowButton";

jest.mock("next-auth/react", () => ({
  useSession: () => ({ status: "authenticated" })
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() })
}));

jest.mock("@/app/components/ToastProvider", () => ({
  useToast: () => ({ push: jest.fn() })
}));

global.fetch = jest.fn(async () => ({
  ok: true,
  json: async () => ({ following: true })
})) as jest.Mock;

describe("FollowButton", () => {
  it("toggles follow", () => {
    render(
      <FollowButton professorId="prof-1" professorSlug="prof" initialFollowing={false} />
    );
    fireEvent.click(screen.getByText("Follow"));
  });
});
