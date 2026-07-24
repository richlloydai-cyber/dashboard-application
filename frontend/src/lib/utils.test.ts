import { describe, it, expect } from "vitest";
import {
  cn,
  formatDuration,
  formatRelativeTime,
  formatNumber,
  getStatusColor,
  getStatusIcon,
  getPillarColor,
  getPillarTextColor,
  getPillarBgColor,
  debounce,
  throttle,
  generateId,
  isValidUrl,
  truncate,
  classNames,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class values", () => {
    expect(cn("a", "b")).toBe("a b");
  });
  it("handles conditional / falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
  it("resolves tailwind conflicts via tailwind-merge", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatDuration", () => {
  it("formats ms", () => {
    expect(formatDuration(500)).toBe("500ms");
  });
  it("formats seconds", () => {
    expect(formatDuration(1500)).toBe("1.5s");
  });
  it("formats minutes", () => {
    expect(formatDuration(120000)).toBe("2.0m");
  });
  it("formats hours", () => {
    expect(formatDuration(3600000)).toBe("1.0h");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-07-24T12:00:00Z").getTime();
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });
  afterEach(() => vi.useRealTimers());

  it("says just now for <60s", () => {
    expect(formatRelativeTime(new Date(now - 1000).toISOString())).toBe("just now");
  });
  it("formats minutes", () => {
    expect(formatRelativeTime(new Date(now - 5 * 60000).toISOString())).toBe("5m ago");
  });
  it("formats hours", () => {
    expect(formatRelativeTime(new Date(now - 3 * 3600000).toISOString())).toBe("3h ago");
  });
  it("formats days", () => {
    expect(formatRelativeTime(new Date(now - 2 * 86400000).toISOString())).toBe("2d ago");
  });
  it("falls back to a date string for >7d", () => {
    const far = new Date(now - 30 * 86400000).toISOString();
    expect(formatRelativeTime(far)).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});

describe("formatNumber", () => {
  it("passes through small numbers", () => {
    expect(formatNumber(999)).toBe("999");
  });
  it("formats thousands", () => {
    expect(formatNumber(12345)).toBe("12.3K");
  });
  it("formats millions", () => {
    expect(formatNumber(2500000)).toBe("2.5M");
  });
});

describe("status mapping", () => {
  it("getStatusColor returns a class for known statuses", () => {
    expect(getStatusColor("success")).toContain("success");
    expect(getStatusColor("failed")).toContain("danger");
    expect(getStatusColor("running")).toContain("primary");
  });
  it("getStatusColor falls back for unknown", () => {
    expect(getStatusColor("bogus")).toContain("neutral");
  });
  it("getStatusIcon returns glyphs", () => {
    expect(getStatusIcon("success")).toBe("✓");
    expect(getStatusIcon("failed")).toBe("✕");
    expect(getStatusIcon("running")).toBe("⟳");
    expect(getStatusIcon("unknown")).toBe("?");
  });
});

describe("pillar color helpers", () => {
  it("map build/quality/deploy/agent", () => {
    expect(getPillarColor("build")).toContain("blue");
    expect(getPillarColor("quality")).toContain("green");
    expect(getPillarColor("deploy")).toContain("purple");
    expect(getPillarColor("agent")).toContain("orange");
    expect(getPillarColor("x")).toContain("neutral");
  });
  it("text + bg variants mirror the base", () => {
    expect(getPillarTextColor("build")).toContain("text-blue-600");
    expect(getPillarBgColor("build")).toContain("bg-blue-50");
  });
});

describe("debounce / throttle", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("debounce delays invocation until settle", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d(1);
    d(2);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(2);
  });

  it("throttle fires immediately then blocks within limit", () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t(1);
    t(2);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);
    vi.advanceTimersByTime(100);
    t(3);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("generateId", () => {
  it("produces a unique-ish string", () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
    expect(a).toContain("-");
  });
});

describe("isValidUrl", () => {
  it("accepts absolute urls", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });
  it("rejects garbage", () => {
    expect(isValidUrl("not a url")).toBe(false);
  });
});

describe("truncate", () => {
  it("leaves short strings alone", () => {
    expect(truncate("abc", 10)).toBe("abc");
  });
  it("truncates long strings with ellipsis", () => {
    expect(truncate("abcdefghij", 5)).toBe("abcde…");
  });
});

describe("classNames", () => {
  it("joins truthy classes", () => {
    expect(classNames("a", false, "b", null)).toBe("a b");
  });
});
