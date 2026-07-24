import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useLiveProjects, useProjectPillarData } from "@/hooks/useLiveProjects";
import { useProjectStore } from "@/lib/store";
import type { ApiResponse } from "@/types";

const mockFetch = (impl: (url: string) => any) => {
  (globalThis as any).fetch = vi.fn(async (url: string) => ({
    ok: true,
    status: 200,
    json: async () => impl(url),
  }));
};

const projResp = (data: unknown[]): ApiResponse<any> => ({ data, error: null, meta: { timestamp: "", requestId: "r", version: "1.0" } });
const arrResp = (data: unknown[]): ApiResponse<any> => ({ data, error: null, meta: { timestamp: "", requestId: "r", version: "1.0" } });

describe("useLiveProjects (live-only, no mocks)", () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
    (globalThis as any).fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it("loads live projects and selects the first", async () => {
    mockFetch((url) => {
      if (url.endsWith("/projects")) return projResp([{ id: "coder-board", displayName: "Coder" }]);
      return arrResp([]);
    });
    const { result } = renderHook(() => useLiveProjects());
    expect(result.current.source).toBe("loading");
    await waitFor(() => expect(result.current.source).toBe("live"));
    expect(useProjectStore.getState().projects).toHaveLength(1);
    expect(useProjectStore.getState().selectedProject?.id).toBe("coder-board");
  });

  it("does NOT keep a stale persisted selection (old mock ghost)", async () => {
    // Simulate a persisted selection from old mock data.
    useProjectStore.getState().setSelectedProject({ id: "multi-tenant" } as any);
    mockFetch((url) => {
      if (url.endsWith("/projects")) return projResp([{ id: "coder-board" }, { id: "product-board" }]);
      return arrResp([]);
    });
    const { result } = renderHook(() => useLiveProjects());
    await waitFor(() => expect(result.current.source).toBe("live"));
    // Stale 'multi-tenant' must be replaced by a live project.
    expect(useProjectStore.getState().selectedProject?.id).toBe("coder-board");
  });

  it("surfaces an error (no silent mock fallback) when adapter returns empty", async () => {
    mockFetch(() => projResp([]));
    const { result } = renderHook(() => useLiveProjects());
    await waitFor(() => expect(result.current.source).toBe("error"));
    expect(useProjectStore.getState().errors.projects).toBeTruthy();
  });

  it("surfaces an error when the adapter request fails", async () => {
    (globalThis as any).fetch = vi.fn(async () => ({
      ok: false, status: 500, statusText: "ERR",
      json: async () => ({ message: "down" }),
    }));
    const { result } = renderHook(() => useLiveProjects());
    await waitFor(() => expect(result.current.source).toBe("error"));
  });
});

describe("useProjectPillarData (live-only)", () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
    (globalThis as any).fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it("returns live pillar data and sets source=live", async () => {
    mockFetch((url) => {
      if (url.includes("/agent-tasks")) return arrResp([{ id: "t1", status: "running" }]);
      return arrResp([{ id: "x" }]);
    });
    const { result } = renderHook(() => useProjectPillarData("coder-board"));
    await waitFor(() => expect(result.current.source).toBe("live"));
    expect(result.current.data?.tasks).toHaveLength(1);
    expect(result.current.data?.pipelines).toBeDefined();
  });

  it("sets source=error when the core task endpoint errors", async () => {
    (globalThis as any).fetch = vi.fn(async (url: string) => ({
      ok: url.includes("agent-tasks") ? false : true,
      status: url.includes("agent-tasks") ? 500 : 200,
      statusText: "ERR",
      json: async () => ({ message: "task endpoint down" }),
    }));
    const { result } = renderHook(() => useProjectPillarData("coder-board"));
    await waitFor(() => expect(result.current.source).toBe("error"));
    expect(result.current.error).toMatch(/task endpoint down/);
    expect(result.current.data).toBeNull();
  });

  it("does nothing when projectId is undefined", async () => {
    const { result } = renderHook(() => useProjectPillarData(undefined));
    await act(async () => { await Promise.resolve(); });
    expect(result.current.data).toBeNull();
    expect(result.current.source).toBe("loading");
  });
});
