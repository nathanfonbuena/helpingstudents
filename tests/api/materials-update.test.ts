import { PATCH } from "@/app/api/materials/[id]/route";

const findUniqueMock = jest.fn();
const updateMock = jest.fn();

jest.mock("@/auth", () => ({
  auth: jest.fn(async () => ({ user: { id: "user-1" } }))
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    material: {
      findUnique: findUniqueMock,
      update: updateMock
    }
  }
}));

const buildRequest = (body: object) =>
  new Request("http://localhost/api/materials/mat-1", {
    method: "PATCH",
    body: JSON.stringify(body)
  });

describe("PATCH /api/materials/[id]", () => {
  it("updates material for owner", async () => {
    findUniqueMock.mockResolvedValue({ uploaderId: "user-1" });
    const response = await PATCH(buildRequest({ title: "New" }), { params: { id: "mat-1" } });
    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalled();
  });
});
