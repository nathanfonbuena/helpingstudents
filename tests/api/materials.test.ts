import { POST } from "@/app/api/materials/route";

const createMock = jest.fn();
const notificationCreateMock = jest.fn();
const notificationCreateManyMock = jest.fn();
const followFindMock = jest.fn();

jest.mock("@/auth", () => ({
  auth: jest.fn(async () => ({ user: { id: "user-1" } }))
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    material: { create: createMock },
    notification: { create: notificationCreateMock, createMany: notificationCreateManyMock },
    userFollow: { findMany: followFindMock }
  }
}));

const buildRequest = (body: object) =>
  new Request("http://localhost/api/materials", {
    method: "POST",
    body: JSON.stringify(body)
  });

describe("POST /api/materials", () => {
  beforeEach(() => {
    createMock.mockReset();
    notificationCreateMock.mockReset();
    notificationCreateManyMock.mockReset();
    followFindMock.mockReset();
  });

  it("validates required fields", async () => {
    const response = await POST(buildRequest({ title: "" }));
    expect(response.status).toBe(400);
  });

  it("creates material and notifications", async () => {
    createMock.mockResolvedValue({ id: "mat-1" });
    followFindMock.mockResolvedValue([{ followerId: "user-2" }]);

    const response = await POST(
      buildRequest({
        title: "Study guide",
        content: "Notes",
        professorId: "prof-1"
      })
    );

    expect(response.status).toBe(200);
    expect(createMock).toHaveBeenCalled();
    expect(notificationCreateMock).toHaveBeenCalled();
    expect(notificationCreateManyMock).toHaveBeenCalled();
  });
});
