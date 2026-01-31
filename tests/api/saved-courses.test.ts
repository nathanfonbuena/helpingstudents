import { POST, DELETE } from "@/app/api/saved/courses/route";

const upsertMock = jest.fn();
const deleteManyMock = jest.fn();

jest.mock("@/auth", () => ({
  auth: jest.fn(async () => ({ user: { id: "user-1" } }))
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    savedCourse: { upsert: upsertMock, deleteMany: deleteManyMock }
  }
}));

const buildRequest = (body: object, method: "POST" | "DELETE") =>
  new Request("http://localhost/api/saved/courses", {
    method,
    body: JSON.stringify(body)
  });

describe("/api/saved/courses", () => {
  beforeEach(() => {
    upsertMock.mockReset();
    deleteManyMock.mockReset();
  });

  it("saves course", async () => {
    const response = await POST(buildRequest({ courseId: "course-1" }, "POST"));
    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalled();
  });

  it("removes saved course", async () => {
    const response = await DELETE(buildRequest({ courseId: "course-1" }, "DELETE"));
    expect(response.status).toBe(200);
    expect(deleteManyMock).toHaveBeenCalled();
  });
});
