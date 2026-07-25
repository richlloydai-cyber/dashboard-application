import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { api } from "@/lib/api";

const ok = (body: unknown) => ({
  ok: true,
  status: 200,
  json: async () => body,
});
const fail = (status: number, body: unknown) => ({
  ok: false,
  status,
  statusText: "ERR",
  json: async () => body,
});

describe("api client", () => {
  beforeEach(() => {
    (globalThis as any).fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it("returns parsed .data on success", async () => {
    (fetch as any).mockResolvedValue(ok({ data: [1, 2], extra: "ignored" }));
    const res = await api.getProjects();
    expect(res.data).toEqual([1, 2]);
    expect(res.error).toBeNull();
    expect(res.meta.version).toBe("1.0");
    expect((fetch as any)).toHaveBeenCalledWith(
      "/projects/api/projects",
      expect.objectContaining({ credentials: "include" })
    );
  });

  it("falls back to raw body when no .data key", async () => {
    (fetch as any).mockResolvedValue(ok({ foo: "bar" }));
    const res = await api.getProjects();
    expect(res.data).toEqual({ foo: "bar" });
  });

  it("maps non-ok responses to an error", async () => {
    (fetch as any).mockResolvedValue(fail(500, { message: "boom" }));
    const res = await api.getProjects();
    expect(res.data).toBeNull();
    expect(res.error?.code).toBe("HTTP_500");
    expect(res.error?.message).toBe("boom");
  });

  it("maps network failure to NETWORK_ERROR", async () => {
    (fetch as any).mockRejectedValue(new Error("offline"));
    const res = await api.getProjects();
    expect(res.data).toBeNull();
    expect(res.error?.code).toBe("NETWORK_ERROR");
    expect(res.error?.message).toBe("offline");
  });

  it("builds project + pillar endpoint URLs", async () => {
    (fetch as any).mockResolvedValue(ok({ data: {} }));
    await api.getProject("coder-board");
    await api.getPipelines("coder-board");
    await api.getPipeline("coder-board", "p1");
    await api.getBuildRuns("coder-board", "p1", 5);
    await api.getBuildRun("coder-board", "p1", "r1");
    await api.triggerBuild("coder-board", "p1", { branch: "main" });
    await api.cancelBuild("coder-board", "p1", "r1");
    await api.getQualityGates("coder-board");
    await api.getQualityGate("coder-board", "g1");
    await api.getQualityRuns("coder-board", "g1", 10);
    await api.triggerQualityScan("coder-board", "g1");
    await api.getEnvironments("coder-board");
    await api.getDeployments("coder-board", "dev", 7);
    await api.getDeployment("coder-board", "d1");
    await api.triggerDeployment("coder-board", "dev", { version: "v1" });
    await api.rollbackDeployment("coder-board", "d1");
    await api.approveDeployment("coder-board", "d1");
    const calls = (fetch as any).mock.calls.map((c: any[]) => c[0]);
    expect(calls).toContain("/projects/api/projects/coder-board");
    expect(calls).toContain("/projects/api/projects/coder-board/pipelines");
    expect(calls).toContain("/projects/api/projects/coder-board/pipelines/p1/runs?limit=5");
    expect(calls).toContain("/projects/api/projects/coder-board/pipelines/p1/runs/r1");
    expect(calls).toContain("/projects/api/projects/coder-board/pipelines/p1/trigger");
    expect(calls).toContain("/projects/api/projects/coder-board/quality-gates/g1/scan");
    expect(calls).toContain("/projects/api/projects/coder-board/environments/dev/deploy");
    expect(calls).toContain("/projects/api/projects/coder-board/deployments/d1/rollback");
  });

  it("passes query params for agent-tasks + statuses", async () => {
    (fetch as any).mockResolvedValue(ok({ data: [] }));
    await api.getAgentTasks("coder-board", "running", 3);
    await api.getAgentStatuses("coder-board");
    await api.triggerAgentTask("coder-board", "custom", { x: 1 });
    await api.cancelAgentTask("coder-board", "t1");
    const calls = (fetch as any).mock.calls.map((c: any[]) => c[0]);
    expect(calls).toContain("/projects/api/projects/coder-board/agent-tasks?limit=3&status=running");
    expect(calls).toContain("/projects/api/projects/coder-board/agents");
    expect(calls).toContain("/projects/api/projects/coder-board/agent-tasks");
    expect(calls).toContain("/projects/api/projects/coder-board/agent-tasks/t1/cancel");
  });

  it("getAgentTask fetches a single task by id", async () => {
    (fetch as any).mockResolvedValue(ok({ data: { id: "t1" } }));
    await api.getAgentTask("coder-board", "t1");
    expect((fetch as any).mock.calls.map((c: any[]) => c[0])).toContain(
      "/projects/api/projects/coder-board/agent-tasks/t1"
    );
  });

  it("getPillarData + getProjectDashboard build range query", async () => {
    (fetch as any).mockResolvedValue(ok({ data: {} }));
    await api.getPillarData("coder-board", "build", "7d");
    await api.getProjectDashboard("coder-board", "30d");
    const calls = (fetch as any).mock.calls.map((c: any[]) => c[0]);
    expect(calls).toContain("/projects/api/projects/coder-board/pillars/build?range=7d");
    expect(calls).toContain("/projects/api/projects/coder-board/dashboard?range=30d");
  });

  describe("websocket (browser only)", () => {
    beforeEach(() => {
      (globalThis as any).WebSocket = class {
        static OPEN = 1;
        static CLOSED = 3;
        readyState = 0;
        onopen: any; onmessage: any; onclose: any; onerror: any;
        send = vi.fn();
        close = vi.fn();
        constructor(public url: string) {
          (globalThis as any).__lastWs = this;
        }
      };
      (globalThis as any).window = { location: { origin: "http://localhost:3000" } };
      process.env["NEXT_PUBLIC_WS_URL"] = "ws://localhost:9999";
      api.disconnect();
    });
    afterEach(() => {
      api.disconnect();
      delete (globalThis as any).WebSocket;
      delete (globalThis as any).window;
      delete process.env["NEXT_PUBLIC_WS_URL"];
    });

    it("connect constructs a socket and dispatches messages", () => {
      api.connect("coder-board");
      const ws: any = (globalThis as any).__lastWs;
      ws.readyState = 1; // WebSocket.OPEN
      expect(ws).toBeDefined();
      expect(ws.url).toContain("project=coder-board");

      // Drive an inbound event -> routed to registered handler.
      const received: any[] = [];
      api.on("agent.task_updated", (e: any) => received.push(e));
      ws.onmessage?.({ data: JSON.stringify({ type: "agent.task_updated", task: { id: "t1" } }) });
      expect(received).toHaveLength(1);

      api.send({ a: 1 });
      expect(ws.send).toHaveBeenCalled();
      api.disconnect();
    });

    it("does not throw when connect called without WebSocket", () => {
      delete (globalThis as any).WebSocket;
      expect(() => api.connect()).not.toThrow();
    });

    it("on() returns an unsubscribe fn", () => {
      const off = api.on("build.started", () => {});
      expect(typeof off).toBe("function");
      expect(() => off()).not.toThrow();
    });
  });
});
