import { POST, DELETE } from "@/app/api/schedule/route";

const createScheduleEntryMock = jest.fn();
const deleteManyMock = jest.fn();
const findUniqueMock = jest.fn();
const findFirstMock = jest.fn();
const createCourseMock = jest.fn();

jest.mock("@/auth", () => ({
  auth: jest.fn(async () => ({ user: { id: "user-1" } }))
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    scheduleEntry: {
      create: (...args: unknown[]) => createScheduleEntryMock(...args),
      deleteMany: (...args: unknown[]) => deleteManyMock(...args)
    },
    user: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args)
    },
    course: {
      findFirst: (...args: unknown[]) => findFirstMock(...args),
      create: (...args: unknown[]) => createCourseMock(...args)
    }
  }
}));

const buildRequest = (body: object, method: "POST" | "DELETE") =>
  new Request("http://localhost/api/schedule", {
    method,
    body: JSON.stringify(body)
  });

describe("/api/schedule", () => {
  beforeEach(() => {
    createScheduleEntryMock.mockReset();
    deleteManyMock.mockReset();
    findUniqueMock.mockReset();
    findFirstMock.mockReset();
    createCourseMock.mockReset();
  });

  describe("POST - with courseId", () => {
    it("rejects missing course id when no manual entry provided", async () => {
      const response = await POST(buildRequest({}, "POST"));
      expect(response.status).toBe(400);
    });

    it("creates schedule entry with existing courseId", async () => {
      createScheduleEntryMock.mockResolvedValue({ id: "entry-1" });
      const response = await POST(buildRequest({ courseId: "course-1" }, "POST"));
      expect(response.status).toBe(200);
      expect(createScheduleEntryMock).toHaveBeenCalled();
    });
  });

  describe("POST - manual course creation", () => {
    it("rejects manual course creation when user has no school", async () => {
      // User has no school
      findUniqueMock.mockResolvedValue({ schools: [] });

      const response = await POST(
        buildRequest(
          { manualCourseName: "Test Course", manualCourseNumber: "CS 101" },
          "POST"
        )
      );

      // Should return 400 error when user has no school
      expect(response.status).toBe(400);
    });

    it("creates new course when user has a school and course does not exist", async () => {
      // User has a school
      findUniqueMock.mockResolvedValue({
        schools: [{ schoolId: "school-1" }]
      });
      // Course does not exist
      findFirstMock.mockResolvedValue(null);
      // Create new course
      createCourseMock.mockResolvedValue({ id: "new-course-1" });
      // Create schedule entry
      createScheduleEntryMock.mockResolvedValue({ id: "entry-1" });

      const response = await POST(
        buildRequest(
          {
            manualCourseName: "Test Course",
            manualCourseNumber: "CS 101",
            term: "Fall 2026"
          },
          "POST"
        )
      );

      expect(response.status).toBe(200);
      expect(createCourseMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          courseNumber: "CS 101",
          name: "Test Course",
          schoolId: "school-1",
          createdById: "user-1"
        })
      });
      expect(createScheduleEntryMock).toHaveBeenCalled();
    });

    it("uses existing course when course already exists at school", async () => {
      // User has a school
      findUniqueMock.mockResolvedValue({
        schools: [{ schoolId: "school-1" }]
      });
      // Course already exists
      findFirstMock.mockResolvedValue({ id: "existing-course-1" });
      // Create schedule entry
      createScheduleEntryMock.mockResolvedValue({ id: "entry-1" });

      const response = await POST(
        buildRequest(
          { manualCourseName: "Test Course", manualCourseNumber: "CS 101" },
          "POST"
        )
      );

      expect(response.status).toBe(200);
      expect(createCourseMock).not.toHaveBeenCalled();
      expect(createScheduleEntryMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          courseId: "existing-course-1"
        })
      });
    });

    it("normalizes course number to uppercase", async () => {
      findUniqueMock.mockResolvedValue({
        schools: [{ schoolId: "school-1" }]
      });
      findFirstMock.mockResolvedValue(null);
      createCourseMock.mockResolvedValue({ id: "new-course-1" });
      createScheduleEntryMock.mockResolvedValue({ id: "entry-1" });

      await POST(
        buildRequest(
          { manualCourseName: "Test Course", manualCourseNumber: "cs 101" },
          "POST"
        )
      );

      expect(createCourseMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          courseNumber: "CS 101"
        })
      });
    });
  });

  describe("DELETE", () => {
    it("deletes schedule entry", async () => {
      const response = await DELETE(
        buildRequest({ entryId: "entry-1" }, "DELETE")
      );
      expect(response.status).toBe(200);
      expect(deleteManyMock).toHaveBeenCalled();
    });

    it("rejects missing entry id", async () => {
      const response = await DELETE(buildRequest({}, "DELETE"));
      expect(response.status).toBe(400);
    });
  });
});
