import { formatCurrency, formatPercent, getReturnColor } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats positive amounts", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });
  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
  it("formats small amounts", () => {
    expect(formatCurrency(10)).toBe("$10.00");
  });
});

describe("formatPercent", () => {
  it("adds + for positive values", () => {
    expect(formatPercent(12.34)).toBe("+12.34%");
  });
  it("adds - for negative values", () => {
    expect(formatPercent(-5.5)).toBe("-5.50%");
  });
  it("shows zero without sign", () => {
    expect(formatPercent(0)).toBe("0.00%");
  });
});

describe("getReturnColor", () => {
  it("returns green class for positive returns", () => {
    expect(getReturnColor(10)).toContain("green");
  });
  it("returns red class for negative returns", () => {
    expect(getReturnColor(-5)).toContain("red");
  });
  it("returns muted for zero", () => {
    const cls = getReturnColor(0);
    expect(cls).toBeTruthy();
  });
});
