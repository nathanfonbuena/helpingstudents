import { POST, DELETE } from "@/app/api/schedule/route";

const createMock = jest.fn();
const deleteManyMock = jest.fn();

jest.mock("@/auth", () => ({
  auth: jest.fn(async () => ({ user: { id: "user-1" } }))
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    scheduleEntry: { create: createMock, deleteMany: deleteManyMock }
  }
}));

const buildRequest = (body: object, method: "POST" | "DELETE") =>
  new Request("http://localhost/api/schedule", {
    method,
    body: JSON.stringify(body)
  });

describe("/api/schedule", () => {
  beforeEach(() => {
    createMock.mockReset();
    deleteManyMock.mockReset();
  });

  it("rejects missing course id", async () => {
    const response = await POST(buildRequest({}, "POST"));
    expect(response.status).toBe(400);
  });

  it("creates schedule entry", async () => {
    createMock.mockResolvedValue({ id: "entry-1" });
    const response = await POST(buildRequest({ courseId: "course-1" }, "POST"));
    expect(response.status).toBe(200);
    expect(createMock).toHaveBeenCalled();
  });

  it("deletes schedule entry", async () => {
    const response = await DELETE(buildRequest({ entryId: "entry-1" }, "DELETE"));
    expect(response.status).toBe(200);
    expect(deleteManyMock).toHaveBeenCalled();
  });
});
