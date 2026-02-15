jest.mock("@/lib/prisma", () => ({
  prisma: {
    school: {
      findUnique: jest.fn()
    },
    $transaction: jest.fn()
  }
}));

import { POST } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/prisma";

const schoolFindUniqueMock = prisma.school.findUnique as jest.Mock;
const transactionMock = prisma.$transaction as jest.Mock;

const userCreateMock = jest.fn();
const userSchoolCreateMock = jest.fn();

const buildRequest = (body: object) =>
  new Request("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body)
  });

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    schoolFindUniqueMock.mockReset();
    transactionMock.mockReset();
    userCreateMock.mockReset();
    userSchoolCreateMock.mockReset();

    transactionMock.mockImplementation(async (cb: (tx: any) => Promise<any>) =>
      cb({
        user: { create: userCreateMock },
        userSchool: { create: userSchoolCreateMock }
      })
    );
  });

  it("creates a student school association from first run selection", async () => {
    schoolFindUniqueMock.mockResolvedValue({ id: "school-1" });
    userCreateMock.mockResolvedValue({ id: "user-1", email: "student@classrack.dev" });

    const response = await POST(
      buildRequest({
        name: "Student User",
        email: "student@classrack.dev",
        password: "password123",
        firstRunSelection: {
          schoolId: "school-1"
        }
      })
    );

    expect(response.status).toBe(200);
    expect(userSchoolCreateMock).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        schoolId: "school-1",
        role: "STUDENT"
      }
    });
  });

  it("creates a professor school association with professor role", async () => {
    schoolFindUniqueMock.mockResolvedValue({ id: "school-2" });
    userCreateMock.mockResolvedValue({ id: "prof-1", email: "prof@classrack.dev" });

    const response = await POST(
      buildRequest({
        name: "Professor User",
        email: "prof@classrack.dev",
        password: "password123",
        role: "PROFESSOR",
        firstRunSelection: {
          schoolId: "school-2"
        }
      })
    );

    expect(response.status).toBe(200);
    expect(userSchoolCreateMock).toHaveBeenCalledWith({
      data: {
        userId: "prof-1",
        schoolId: "school-2",
        role: "PROFESSOR"
      }
    });
  });

  it("does not create school association when selected school is invalid", async () => {
    schoolFindUniqueMock.mockResolvedValue(null);
    userCreateMock.mockResolvedValue({ id: "user-2", email: "noschool@classrack.dev" });

    const response = await POST(
      buildRequest({
        name: "No School",
        email: "noschool@classrack.dev",
        password: "password123",
        firstRunSelection: {
          schoolId: "missing-school"
        }
      })
    );

    expect(response.status).toBe(200);
    expect(userSchoolCreateMock).not.toHaveBeenCalled();
  });
});
