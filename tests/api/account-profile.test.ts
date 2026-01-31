import { PATCH } from "@/app/api/account/profile/route";

const updateMock = jest.fn();
const deleteManyMock = jest.fn();
const createMock = jest.fn();

jest.mock("@/auth", () => ({
  auth: jest.fn(async () => ({ user: { id: "user-1" } }))
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(async (cb: (tx: any) => Promise<void>) => {
      await cb({
        user: { update: updateMock },
        userSchool: { deleteMany: deleteManyMock, create: createMock }
      });
    })
  }
}));

const buildRequest = (body: object) =>
  new Request("http://localhost/api/account/profile", {
    method: "PATCH",
    body: JSON.stringify(body)
  });

describe("PATCH /api/account/profile", () => {
  beforeEach(() => {
    updateMock.mockClear();
    deleteManyMock.mockClear();
    createMock.mockClear();
  });

  it("rejects invalid graduation year", async () => {
    const response = await PATCH(buildRequest({ year: "abc" }));
    expect(response.status).toBe(400);
  });

  it("updates profile with trimmed values", async () => {
    await PATCH(buildRequest({ name: "  Ada ", major: " CS ", year: "2028" }));
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Ada",
          major: "CS",
          year: "2028"
        })
      })
    );
  });
});
