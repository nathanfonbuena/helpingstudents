import { slugify } from "@/app/lib/slug";

describe("slugify", () => {
  it("lowercases and replaces spaces", () => {
    expect(slugify("Dr. Ada Lovelace")).toBe("dr-ada-lovelace");
  });

  it("trims hyphens", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });
});
