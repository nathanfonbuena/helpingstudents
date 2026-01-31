import { POST, DELETE } from "@/app/api/materials/save/route";

const upsertMock = jest.fn();
const deleteManyMock = jest.fn();

jest.mock("@/auth", () => ({
  auth: jest.fn(async () => ({ user: { id: "user-1" } }))
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    materialSave: { upsert: upsertMock, deleteMany: deleteManyMock }
  }
}));

const buildRequest = (body: object, method: "POST" | "DELETE") =>
  new Request("http://localhost/api/materials/save", {
    method,
    body: JSON.stringify(body)
  });

describe("/api/materials/save", () => {
  beforeEach(() => {
    upsertMock.mockReset();
    deleteManyMock.mockReset();
  });

  it("saves material", async () => {
    const response = await POST(buildRequest({ materialId: "mat-1" }, "POST"));
    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalled();
  });

  it("removes saved material", async () => {
    const response = await DELETE(buildRequest({ materialId: "mat-1" }, "DELETE"));
    expect(response.status).toBe(200);
    expect(deleteManyMock).toHaveBeenCalled();
  });
});
