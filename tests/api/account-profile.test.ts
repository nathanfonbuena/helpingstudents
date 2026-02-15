jest.mock("@/auth", () => ({
  auth: jest.fn(async () => ({ user: { id: "user-1" } }))
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    },
    $transaction: jest.fn()
  }
}));

import { PATCH } from "@/app/api/account/profile/route";
import { prisma } from "@/lib/prisma";

const findUniqueMock = prisma.user.findUnique as jest.Mock;
const transactionMock = prisma.$transaction as jest.Mock;
const updateMock = jest.fn();
const deleteManyMock = jest.fn();
const createMock = jest.fn();
const upsertProfessorProfileMock = jest.fn();

const buildRequest = (body: object) =>
  new Request("http://localhost/api/account/profile", {
    method: "PATCH",
    body: JSON.stringify(body)
  });

describe("PATCH /api/account/profile", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    transactionMock.mockReset();
    updateMock.mockReset();
    deleteManyMock.mockReset();
    createMock.mockReset();
    upsertProfessorProfileMock.mockReset();

    findUniqueMock.mockResolvedValue({ role: "STUDENT" });
    transactionMock.mockImplementation(async (cb: (tx: any) => Promise<void>) =>
      cb({
        user: { update: updateMock },
        userSchool: { deleteMany: deleteManyMock, create: createMock },
        professorProfile: { upsert: upsertProfessorProfileMock }
      })
    );
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
          year: "2028",
          role: "STUDENT"
        })
      })
    );
  });

  it("updates role and school with professor profile bootstrap", async () => {
    await PATCH(buildRequest({ schoolId: "school-1", role: "PROFESSOR" }));

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: "PROFESSOR"
        })
      })
    );
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          schoolId: "school-1",
          role: "PROFESSOR"
        })
      })
    );
    expect(upsertProfessorProfileMock).toHaveBeenCalled();
  });
});
