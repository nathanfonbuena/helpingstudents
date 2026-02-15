import { render, screen } from "@testing-library/react";
import ScheduleCard from "@/app/components/account/ScheduleCard";

jest.mock("@/app/components/ScheduleModalTrigger", () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <button>{label}</button>
}));

jest.mock("@/app/components/UploadMaterialModalTrigger", () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <button>{label}</button>
}));

jest.mock("@/app/components/SaveCourseButton", () => ({
  __esModule: true,
  default: () => <button>Save</button>
}));

jest.mock("@/app/components/RemoveScheduleButton", () => ({
  __esModule: true,
  default: () => <button>Remove</button>
}));

jest.mock("@/app/components/ScheduleImportModalTrigger", () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <button>{label}</button>
}));

describe("ScheduleCard", () => {
  it("renders empty state", () => {
    render(
      <ScheduleCard
        entries={[]}
        savedCourseIds={new Set()}
        schoolId={null}
        currentUserId="test-user"
      />
    );
    expect(screen.getByText(/Add your schedule/)).toBeInTheDocument();
  });
});
