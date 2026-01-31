import { POST } from "@/app/api/schedule/import/route";

const findFirstMock = jest.fn();
const createMock = jest.fn();

jest.mock("@/auth", () => ({
  auth: jest.fn(async () => ({ user: { id: "user-1" } }))
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    userSchool: { findFirst: findFirstMock },
    course: { findFirst: jest.fn(async () => ({ id: "course-1" })) },
    scheduleEntry: { create: createMock }
  }
}));

const buildRequest = (csv: string) => {
  const file = new File([csv], "schedule.csv", { type: "text/csv" });
  const formData = new FormData();
  formData.append("file", file);
  return new Request("http://localhost/api/schedule/import", {
    method: "POST",
    body: formData
  });
};

describe("POST /api/schedule/import", () => {
  it("imports rows", async () => {
    findFirstMock.mockResolvedValue({ schoolId: "school-1" });
    const response = await POST(buildRequest("CS-101, Fall 2026, MW 10:00-11:00"));
    expect(response.status).toBe(200);
    expect(createMock).toHaveBeenCalled();
  });
});
