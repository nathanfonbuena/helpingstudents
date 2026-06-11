import { PATCH } from "@/app/api/admin/users/[id]/route";

const authMock = jest.fn();
const userFindUniqueMock = jest.fn();
const userUpdateMock = jest.fn();

jest.mock("@/auth", () => ({
  auth: (...args: unknown[]) => authMock(...args)
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => userFindUniqueMock(...args),
      update: (...args: unknown[]) => userUpdateMock(...args)
    }
  }
}));

const ADMIN_USER = { id: "admin-1", email: "admin@classrack.app" };
const NON_ADMIN_USER = { id: "user-1", email: "student@classrack.app" };
const TARGET_USER_ID = "user-2";

const buildRequest = (body: object) =>
  new Request(`http://localhost/api/admin/users/${TARGET_USER_ID}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });

const callRoute = (body: object, id: string = TARGET_USER_ID) =>
  PATCH(buildRequest(body), { params: { id } });

describe("PATCH /api/admin/users/[id]", () => {
  beforeEach(() => {
    authMock.mockReset();
    userFindUniqueMock.mockReset();
    userUpdateMock.mockReset();
  });

  it("rejects unauthenticated requests with 401", async () => {
    authMock.mockResolvedValue(null);

    const response = await callRoute({ isAdmin: true });

    expect(response.status).toBe(401);
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it("rejects authenticated non-admin users with 403", async () => {
    authMock.mockResolvedValue({ user: NON_ADMIN_USER });
    // First findUnique call is the isAdmin check on the requester.
    userFindUniqueMock.mockResolvedValueOnce({ isAdmin: false });

    const response = await callRoute({ isAdmin: true });

    expect(response.status).toBe(403);
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it("rejects a non-boolean isAdmin value with 400", async () => {
    authMock.mockResolvedValue({ user: ADMIN_USER });
    userFindUniqueMock.mockResolvedValueOnce({ isAdmin: true });

    const response = await callRoute({ isAdmin: "yes" });

    expect(response.status).toBe(400);
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it("prevents an admin from removing their own admin access", async () => {
    authMock.mockResolvedValue({ user: ADMIN_USER });
    userFindUniqueMock.mockResolvedValueOnce({ isAdmin: true });

    const response = await callRoute({ isAdmin: false }, ADMIN_USER.id);

    expect(response.status).toBe(400);
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the target user does not exist", async () => {
    authMock.mockResolvedValue({ user: ADMIN_USER });
    userFindUniqueMock
      .mockResolvedValueOnce({ isAdmin: true }) // requester admin check
      .mockResolvedValueOnce(null); // target user lookup

    const response = await callRoute({ isAdmin: true });

    expect(response.status).toBe(404);
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it("grants admin access to another user", async () => {
    authMock.mockResolvedValue({ user: ADMIN_USER });
    userFindUniqueMock
      .mockResolvedValueOnce({ isAdmin: true }) // requester admin check
      .mockResolvedValueOnce({ id: TARGET_USER_ID }); // target user lookup
    userUpdateMock.mockResolvedValue({
      id: TARGET_USER_ID,
      email: "jane@classrack.app",
      name: "Jane Doe",
      role: "PROFESSOR",
      isAdmin: true
    });

    const response = await callRoute({ isAdmin: true });

    expect(response.status).toBe(200);
    expect(userUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: TARGET_USER_ID },
        data: { isAdmin: true }
      })
    );
  });

  it("revokes admin access from another user", async () => {
    authMock.mockResolvedValue({ user: ADMIN_USER });
    userFindUniqueMock
      .mockResolvedValueOnce({ isAdmin: true }) // requester admin check
      .mockResolvedValueOnce({ id: TARGET_USER_ID }); // target user lookup
    userUpdateMock.mockResolvedValue({
      id: TARGET_USER_ID,
      email: "jane@classrack.app",
      name: "Jane Doe",
      role: "PROFESSOR",
      isAdmin: false
    });

    const response = await callRoute({ isAdmin: false });

    expect(response.status).toBe(200);
    expect(userUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: TARGET_USER_ID },
        data: { isAdmin: false }
      })
    );
  });
});
