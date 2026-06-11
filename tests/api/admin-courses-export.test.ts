import { GET } from "@/app/api/admin/courses/export/route";

const authMock = jest.fn();
const schoolFindUniqueMock = jest.fn();
const courseFindManyMock = jest.fn();
const userFindUniqueMock = jest.fn();

jest.mock("@/auth", () => ({
  auth: (...args: unknown[]) => authMock(...args)
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    school: { findUnique: (...args: unknown[]) => schoolFindUniqueMock(...args) },
    course: { findMany: (...args: unknown[]) => courseFindManyMock(...args) },
    user: { findUnique: (...args: unknown[]) => userFindUniqueMock(...args) }
  }
}));

const ADMIN_USER = { id: "admin-1", email: "admin@classrack.app" };
const NON_ADMIN_USER = { id: "user-1", email: "student@classrack.app" };

const buildRequest = (schoolId: string | null = "school-1") => {
  const url = new URL("http://localhost/api/admin/courses/export");
  if (schoolId !== null) {
    url.searchParams.set("schoolId", schoolId);
  }
  return new Request(url, { method: "GET" });
};

describe("GET /api/admin/courses/export", () => {
  beforeEach(() => {
    authMock.mockReset();
    schoolFindUniqueMock.mockReset();
    courseFindManyMock.mockReset();
    userFindUniqueMock.mockReset();

    schoolFindUniqueMock.mockResolvedValue({ id: "school-1", name: "Test School", slug: "test-school" });
    courseFindManyMock.mockResolvedValue([
      {
        courseNumber: "CS 101",
        name: "Intro to CS",
        description: "Intro course",
        credits: 3,
        department: { code: "CS" },
        professor: { name: "Jane Doe" }
      }
    ]);
  });

  it("rejects unauthenticated requests with 401 and reads no data", async () => {
    authMock.mockResolvedValue(null);

    const response = await GET(buildRequest());

    expect(response.status).toBe(401);
    expect(userFindUniqueMock).not.toHaveBeenCalled();
    expect(schoolFindUniqueMock).not.toHaveBeenCalled();
    expect(courseFindManyMock).not.toHaveBeenCalled();
  });

  it("rejects authenticated non-admin users with 403 and reads no data", async () => {
    authMock.mockResolvedValue({ user: NON_ADMIN_USER });
    userFindUniqueMock.mockResolvedValue({ isAdmin: false });

    const response = await GET(buildRequest());

    expect(response.status).toBe(403);
    expect(schoolFindUniqueMock).not.toHaveBeenCalled();
    expect(courseFindManyMock).not.toHaveBeenCalled();
  });

  it("allows configured admins to export courses as CSV", async () => {
    authMock.mockResolvedValue({ user: ADMIN_USER });
    userFindUniqueMock.mockResolvedValue({ isAdmin: true });

    const response = await GET(buildRequest());
    const csv = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/csv");
    expect(csv).toContain("CS 101,Intro to CS,CS,Intro course,3,Jane Doe");
  });
});
