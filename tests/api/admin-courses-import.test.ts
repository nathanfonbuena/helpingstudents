import { POST } from "@/app/api/admin/courses/import/route";

const authMock = jest.fn();

const schoolFindUniqueMock = jest.fn();
const departmentUpsertMock = jest.fn();
const userFindUniqueMock = jest.fn();
const userFindFirstMock = jest.fn();
const userCreateMock = jest.fn();
const courseFindUniqueMock = jest.fn();
const courseCreateMock = jest.fn();
const courseUpdateMock = jest.fn();

jest.mock("@/auth", () => ({
  auth: (...args: unknown[]) => authMock(...args)
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    school: { findUnique: (...args: unknown[]) => schoolFindUniqueMock(...args) },
    department: { upsert: (...args: unknown[]) => departmentUpsertMock(...args) },
    user: {
      findUnique: (...args: unknown[]) => userFindUniqueMock(...args),
      findFirst: (...args: unknown[]) => userFindFirstMock(...args),
      create: (...args: unknown[]) => userCreateMock(...args)
    },
    course: {
      findUnique: (...args: unknown[]) => courseFindUniqueMock(...args),
      create: (...args: unknown[]) => courseCreateMock(...args),
      update: (...args: unknown[]) => courseUpdateMock(...args)
    }
  }
}));

const ADMIN_USER = { id: "admin-1", email: "admin@classrack.app" };
const NON_ADMIN_USER = { id: "user-1", email: "student@classrack.app" };

const CSV = [
  "courseNumber,name,departmentCode,description,credits,professorName",
  "CS 101,Intro to CS,CS,Intro course,3,Jane Doe"
].join("\n");

// Build a minimal request-like object instead of `new Request(..., { body:
// formData })`. The whatwg-fetch polyfill used in jsdom can't read a
// FormData body back out (`could not read FormData body as text`), and
// jsdom's File doesn't implement `.text()`, so we hand the route exactly
// what it uses: `request.formData()` -> an object with `.get()`, where
// `.get("file")` returns something with `.text()`.
const buildRequest = (csv: string = CSV, schoolId: string = "school-1") => {
  const file = { text: async () => csv };
  const formData = {
    get: (key: string) => {
      if (key === "schoolId") return schoolId;
      if (key === "file") return file;
      return null;
    }
  };
  return { formData: async () => formData } as unknown as Request;
};

describe("POST /api/admin/courses/import", () => {
  beforeEach(() => {
    authMock.mockReset();
    schoolFindUniqueMock.mockReset();
    departmentUpsertMock.mockReset();
    userFindUniqueMock.mockReset();
    userFindFirstMock.mockReset();
    userCreateMock.mockReset();
    courseFindUniqueMock.mockReset();
    courseCreateMock.mockReset();
    courseUpdateMock.mockReset();

    schoolFindUniqueMock.mockResolvedValue({ id: "school-1", name: "Test School" });
    departmentUpsertMock.mockResolvedValue({ id: "dept-1" });
    userFindFirstMock.mockResolvedValue(null);
    userCreateMock.mockResolvedValue({ id: "prof-1" });
    courseFindUniqueMock.mockResolvedValue(null);
    courseCreateMock.mockResolvedValue({ id: "course-1" });
  });

  it("rejects unauthenticated requests with 401 and performs no writes", async () => {
    authMock.mockResolvedValue(null);

    const response = await POST(buildRequest());

    expect(response.status).toBe(401);
    expect(userFindUniqueMock).not.toHaveBeenCalled();
    expect(schoolFindUniqueMock).not.toHaveBeenCalled();
    expect(courseCreateMock).not.toHaveBeenCalled();
    expect(courseUpdateMock).not.toHaveBeenCalled();
    expect(departmentUpsertMock).not.toHaveBeenCalled();
    expect(userCreateMock).not.toHaveBeenCalled();
  });

  it("rejects authenticated non-admin users with 403 and performs no writes", async () => {
    authMock.mockResolvedValue({ user: NON_ADMIN_USER });
    userFindUniqueMock.mockResolvedValue({ isAdmin: false });

    const response = await POST(buildRequest());

    expect(response.status).toBe(403);
    expect(schoolFindUniqueMock).not.toHaveBeenCalled();
    expect(courseCreateMock).not.toHaveBeenCalled();
    expect(courseUpdateMock).not.toHaveBeenCalled();
    expect(departmentUpsertMock).not.toHaveBeenCalled();
    expect(userCreateMock).not.toHaveBeenCalled();
  });

  it("allows configured admins to import courses", async () => {
    authMock.mockResolvedValue({ user: ADMIN_USER });
    userFindUniqueMock.mockResolvedValue({ isAdmin: true });

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(userFindUniqueMock).toHaveBeenCalledWith({
      where: { id: ADMIN_USER.id },
      select: { isAdmin: true }
    });
    expect(courseCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          courseNumber: "CS 101",
          name: "Intro to CS",
          schoolId: "school-1",
          departmentId: "dept-1",
          professorId: "prof-1"
        })
      })
    );
  });
});
