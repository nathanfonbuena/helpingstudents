import { GET } from "@/app/api/courses/suggest/route";

const findManyMock = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    course: { findMany: findManyMock }
  }
}));

describe("GET /api/courses/suggest", () => {
  it("returns empty on short query", async () => {
    const response = await GET(new Request("http://localhost/api/courses/suggest?q=a"));
    const payload = await response.json();
    expect(payload.courses).toEqual([]);
  });

  it("queries courses", async () => {
    findManyMock.mockResolvedValue([]);
    const response = await GET(new Request("http://localhost/api/courses/suggest?q=cs"));
    expect(response.status).toBe(200);
  });
});
