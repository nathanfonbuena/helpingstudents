jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn()
  }
}));

import { POST } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/prisma";

const transactionMock = prisma.$transaction as jest.Mock;

const userCreateMock = jest.fn();

const buildRequest = (body: object) =>
  new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    transactionMock.mockReset();
    userCreateMock.mockReset();

    transactionMock.mockImplementation(async (cb: (tx: any) => Promise<any>) =>
      cb({
        user: { create: userCreateMock }
      })
    );
  });

  it("creates a student user with no school association", async () => {
    userCreateMock.mockResolvedValue({ id: "user-1", email: "student@knocore.dev" });

    const response = await POST(
      buildRequest({
        name: "Student User",
        email: "student@knocore.dev",
        password: "password123"
      })
    );

    expect(response.status).toBe(200);
    expect(userCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "student@knocore.dev",
          role: "STUDENT"
        })
      })
    );
  });

  it("creates a professor user with professor profile", async () => {
    userCreateMock.mockResolvedValue({ id: "prof-1", email: "prof@knocore.dev" });

    const response = await POST(
      buildRequest({
        name: "Professor User",
        email: "prof@knocore.dev",
        password: "password123",
        role: "PROFESSOR"
      })
    );

    expect(response.status).toBe(200);
    expect(userCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: "PROFESSOR",
          professorProfile: { create: { isClaimed: false } }
        })
      })
    );
  });

  it("returns 400 when email is missing", async () => {
    const response = await POST(
      buildRequest({
        name: "Test",
        password: "password123"
      })
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when password is too short", async () => {
    const response = await POST(
      buildRequest({
        email: "test@knocore.dev",
        password: "short"
      })
    );

    expect(response.status).toBe(400);
  });

  it("defaults to STUDENT role when role is not specified", async () => {
    userCreateMock.mockResolvedValue({ id: "user-2", email: "default@knocore.dev" });

    await POST(
      buildRequest({
        name: "Default Role",
        email: "default@knocore.dev",
        password: "password123"
      })
    );

    expect(userCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: "STUDENT"
        })
      })
    );
  });
});
