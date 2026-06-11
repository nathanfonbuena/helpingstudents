import { GET } from "@/app/api/admin/users/route";

const authMock = jest.fn();
const userFindUniqueMock = jest.fn();
const userFindManyMock = jest.fn();

jest.mock("@/auth", () => ({
  auth: (...args: unknown[]) => authMock(...args)
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => userFindUniqueMock(...args),
      findMany: (...args: unknown[]) => userFindManyMock(...args)
    }
  }
}));

const ADMIN_USER = { id: "admin-1", email: "admin@classrack.app" };
const NON_ADMIN_USER = { id: "user-1", email: "student@classrack.app" };

const buildRequest = (q?: string) => {
  const url = new URL("http://localhost/api/admin/users");
  if (q !== undefined) {
    url.searchParams.set("q", q);
  }
  return new Request(url, { method: "GET" });
};

describe("GET /api/admin/users", () => {
  beforeEach(() => {
    authMock.mockReset();
    userFindUniqueMock.mockReset();
    userFindManyMock.mockReset();
    userFindManyMock.mockResolvedValue([]);
  });

  it("rejects unauthenticated requests with 401 and reads no data", async () => {
    authMock.mockResolvedValue(null);

    const response = await GET(buildRequest());

    expect(response.status).toBe(401);
    expect(userFindUniqueMock).not.toHaveBeenCalled();
    expect(userFindManyMock).not.toHaveBeenCalled();
  });

  it("rejects authenticated non-admin users with 403 and reads no data", async () => {
    authMock.mockResolvedValue({ user: NON_ADMIN_USER });
    userFindUniqueMock.mockResolvedValue({ isAdmin: false });

    const response = await GET(buildRequest());

    expect(response.status).toBe(403);
    expect(userFindManyMock).not.toHaveBeenCalled();
  });

  it("returns the current admins when no search query is given", async () => {
    authMock.mockResolvedValue({ user: ADMIN_USER });
    userFindUniqueMock.mockResolvedValue({ isAdmin: true });
    userFindManyMock.mockResolvedValue([
      { id: "admin-1", email: "admin@classrack.app", name: "Admin User", role: "STUDENT", isAdmin: true }
    ]);

    const response = await GET(buildRequest());

    expect(response.status).toBe(200);
    expect(userFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isAdmin: true } })
    );
  });

  it("treats a query shorter than 2 characters the same as no query", async () => {
    authMock.mockResolvedValue({ user: ADMIN_USER });
    userFindUniqueMock.mockResolvedValue({ isAdmin: true });

    const response = await GET(buildRequest("a"));

    expect(response.status).toBe(200);
    expect(userFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isAdmin: true } })
    );
  });

  it("searches users by email/name when a query is given", async () => {
    authMock.mockResolvedValue({ user: ADMIN_USER });
    userFindUniqueMock.mockResolvedValue({ isAdmin: true });
    userFindManyMock.mockResolvedValue([
      { id: "user-2", email: "jane@classrack.app", name: "Jane Doe", role: "PROFESSOR", isAdmin: false }
    ]);

    const response = await GET(buildRequest("jane"));

    expect(response.status).toBe(200);
    expect(userFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { email: { contains: "jane", mode: "insensitive" } },
            { name: { contains: "jane", mode: "insensitive" } }
          ]
        }
      })
    );
  });
});
