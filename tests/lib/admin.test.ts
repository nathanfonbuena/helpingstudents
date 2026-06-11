const findUniqueMock = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => findUniqueMock(...args) }
  }
}));

import { isAdmin } from "@/lib/admin";

describe("isAdmin", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
  });

  it("returns false for null/undefined/empty userId without querying the database", async () => {
    expect(await isAdmin(null)).toBe(false);
    expect(await isAdmin(undefined)).toBe(false);
    expect(await isAdmin("")).toBe(false);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns true when the user's isAdmin flag is set", async () => {
    findUniqueMock.mockResolvedValue({ isAdmin: true });

    expect(await isAdmin("user-1")).toBe(true);
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { isAdmin: true }
    });
  });

  it("returns false when the user's isAdmin flag is false", async () => {
    findUniqueMock.mockResolvedValue({ isAdmin: false });

    expect(await isAdmin("user-1")).toBe(false);
  });

  it("returns false when the user does not exist", async () => {
    findUniqueMock.mockResolvedValue(null);

    expect(await isAdmin("missing-user")).toBe(false);
  });
});
