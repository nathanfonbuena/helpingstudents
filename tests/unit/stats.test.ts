import { average } from "@/app/lib/stats";

describe("average", () => {
  it("returns null for empty values", () => {
    expect(average([])).toBeNull();
  });

  it("returns average for values", () => {
    expect(average([1, 2, 3])).toBeCloseTo(2);
  });
});
