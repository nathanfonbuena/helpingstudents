import { GET } from "@/app/api/search/suggest/route";

const schoolFindMock = jest.fn();
const professorFindMock = jest.fn();
const courseFindMock = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    school: { findMany: schoolFindMock },
    user: { findMany: professorFindMock },
    course: { findMany: courseFindMock }
  }
}));

describe("GET /api/search/suggest", () => {
  it("returns empty on short query", async () => {
    const response = await GET(new Request("http://localhost/api/search/suggest?q=a"));
    const payload = await response.json();
    expect(payload.schools).toEqual([]);
  });

  it("queries suggestions", async () => {
    schoolFindMock.mockResolvedValue([]);
    professorFindMock.mockResolvedValue([]);
    courseFindMock.mockResolvedValue([]);
    const response = await GET(new Request("http://localhost/api/search/suggest?q=math"));
    expect(response.status).toBe(200);
  });
});
