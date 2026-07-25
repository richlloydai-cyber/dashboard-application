import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ProjectView } from "@/components/projects/ProjectView";
import { useProjectStore } from "@/lib/store";
import type { Project } from "@/types";

const p = (id: string): Project => ({
  id, name: id, displayName: id, description: "",
  repository: { provider: "local", url: "local", owner: "h", name: id, defaultBranch: "main", currentBranch: "main", commitSha: "", commitMessage: "", lastPush: "" },
  status: "active", pillar: "agent",
  createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z", lastActivity: "2026-01-01T00:00:00Z",
  metadata: { language: "N/A", framework: "Hermes", packageManager: "npm", nodeVersion: "20", dockerized: true, kubernetes: false, environments: [], tags: [], owner: "R", team: id },
});

const live = (url: string) => ({
  ok: true, status: 200,
  json: async () => {
    if (url.includes("/agent-tasks")) return { data: [{ id: "t1", projectId: "coder-board", agentId: "c", agentName: "c", type: "custom", status: "running", priority: "normal", title: "task", description: "", input: {}, progress: 1, steps: [], startedAt: "", updatedAt: "", logs: [], artifacts: [], metadata: { tags: [] } }], error: null, meta: {} };
    return { data: [], error: null, meta: {} };
  },
});

describe("<ProjectView />", () => {
  beforeEach(() => useProjectStore.getState().reset());
  afterEach(() => vi.restoreAllMocks());

  it("shows 'No project selected' when none", () => {
    render(<ProjectView />);
    expect(screen.getByText("No project selected")).toBeInTheDocument();
  });

  it("renders the three pillars from live data", async () => {
    useProjectStore.getState().setSelectedProject(p("coder-board"));
    (globalThis as any).fetch = vi.fn((url: string) => Promise.resolve(live(url)));
    render(<ProjectView />);
    await waitFor(() => expect(screen.getByText("Integrate")).toBeInTheDocument());
    expect(screen.getByText("Deliver")).toBeInTheDocument();
    expect(screen.getByText("Operate")).toBeInTheDocument();
  });

  it("shows explicit 'Live data unavailable' when source=error", async () => {
    useProjectStore.getState().setSelectedProject(p("coder-board"));
    (globalThis as any).fetch = vi.fn(async (url: string) => ({
      ok: url.includes("/agent-tasks") ? false : true,
      status: url.includes("/agent-tasks") ? 500 : 200,
      statusText: "ERR",
      json: async () => ({ message: "adapter down" }),
    }));
    render(<ProjectView />);
    await waitFor(() => expect(screen.getByText("Live data unavailable")).toBeInTheDocument());
    // Retry button re-triggers the load.
    const retry = screen.getByText("Retry");
    expect(retry).toBeInTheDocument();
    (globalThis as any).fetch = vi.fn((url: string) => Promise.resolve(live(url)));
    await act(async () => { fireEvent.click(retry); });
    await waitFor(() => expect(screen.getByText("Integrate")).toBeInTheDocument());
  });
});
