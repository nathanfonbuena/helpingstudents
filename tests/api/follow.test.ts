import { POST, DELETE } from "@/app/api/follow/route";

const createMock = jest.fn();
const findUniqueMock = jest.fn();
const deleteManyMock = jest.fn();

jest.mock("@/auth", () => ({
  auth: jest.fn(async () => ({ user: { id: "user-1" } }))
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    userFollow: {
      findUnique: findUniqueMock,
      create: createMock,
      deleteMany: deleteManyMock
    }
  }
}));

const buildRequest = (body: object, method: "POST" | "DELETE") =>
  new Request("http://localhost/api/follow", {
    method,
    body: JSON.stringify(body)
  });

describe("/api/follow", () => {
  beforeEach(() => {
    createMock.mockReset();
    findUniqueMock.mockReset();
    deleteManyMock.mockReset();
  });

  it("creates follow", async () => {
    findUniqueMock.mockResolvedValue(null);
    const response = await POST(buildRequest({ followingId: "prof-1" }, "POST"));
    expect(response.status).toBe(200);
    expect(createMock).toHaveBeenCalled();
  });

  it("deletes follow", async () => {
    const response = await DELETE(buildRequest({ followingId: "prof-1" }, "DELETE"));
    expect(response.status).toBe(200);
    expect(deleteManyMock).toHaveBeenCalled();
  });
});
