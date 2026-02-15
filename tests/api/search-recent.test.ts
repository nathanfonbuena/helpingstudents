jest.mock("@/auth", () => ({
  auth: jest.fn()
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    searchHistory: {
      findMany: jest.fn()
    },
    $transaction: jest.fn()
  }
}));

import { GET, POST } from "@/app/api/search/recent/route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const authMock = auth as jest.Mock;
const findManyMock = prisma.searchHistory.findMany as jest.Mock;
const transactionMock = prisma.$transaction as jest.Mock;

const upsertMock = jest.fn();
const txFindManyMock = jest.fn();
const deleteManyMock = jest.fn();

const buildRequest = (body: object) =>
  new Request("http://localhost/api/search/recent", {
    method: "POST",
    body: JSON.stringify(body)
  });

describe("/api/search/recent", () => {
  beforeEach(() => {
    authMock.mockReset();
    findManyMock.mockReset();
    transactionMock.mockReset();
    upsertMock.mockReset();
    txFindManyMock.mockReset();
    deleteManyMock.mockReset();
  });

  it("returns empty recent list when user is unauthenticated", async () => {
    authMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("returns account-level recent searches for signed in users", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    findManyMock.mockResolvedValue([{ query: "UC Berkeley" }, { query: "Dr. Chen" }]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        take: 5
      })
    );
  });

  it("upserts recent query and trims overflow rows", async () => {
    authMock.mockResolvedValue({ user: { id: "user-2" } });
    txFindManyMock.mockResolvedValue([{ id: "old-1" }, { id: "old-2" }]);
    transactionMock.mockImplementation(async (cb: (tx: any) => Promise<void>) =>
      cb({
        searchHistory: {
          upsert: upsertMock,
          findMany: txFindManyMock,
          deleteMany: deleteManyMock
        }
      })
    );

    const response = await POST(buildRequest({ query: "  Dr. Smith  " }));

    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_normalizedQuery: {
            userId: "user-2",
            normalizedQuery: "dr. smith"
          }
        },
        create: expect.objectContaining({
          userId: "user-2",
          query: "Dr. Smith",
          normalizedQuery: "dr. smith"
        })
      })
    );
    expect(deleteManyMock).toHaveBeenCalledWith({
      where: { id: { in: ["old-1", "old-2"] } }
    });
  });
});
