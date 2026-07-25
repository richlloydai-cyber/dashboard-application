import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useProjectStore } from "@/lib/store";
import type { Project } from "@/types";

const p = (id: string): Project => ({
  id, name: id, displayName: id, description: "",
  repository: { provider: "local", url: "local", owner: "h", name: id, defaultBranch: "main", currentBranch: "main", commitSha: "", commitMessage: "", lastPush: "" },
  status: "active", pillar: "agent",
  createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z", lastActivity: "2026-01-01T00:00:00Z",
  metadata: { language: "N/A", framework: "Hermes", packageManager: "npm", nodeVersion: "20", dockerized: true, kubernetes: false, environments: [], tags: [], owner: "R", team: id },
});

describe("<DashboardShell />", () => {
  beforeEach(() => useProjectStore.getState().reset());
  afterEach(() => vi.restoreAllMocks());

  it("renders header + sidebar and seeds projects from the live adapter", async () => {
    (globalThis as any).fetch = vi.fn(async (url: string) => ({
      ok: true, status: 200,
      json: async () => (url.endsWith("/projects")
        ? { data: [p("coder-board")], error: null, meta: { timestamp: "", requestId: "r", version: "1.0" } }
        : { data: [], error: null, meta: { timestamp: "", requestId: "r", version: "1.0" } }),
    }));
    render(<DashboardShell>child</DashboardShell>);
    expect(screen.getByText("Hermes Project Control")).toBeInTheDocument();
    await waitFor(() => expect(useProjectStore.getState().projects).toHaveLength(1));
  });

  it("sets error source when adapter is down", async () => {
    (globalThis as any).fetch = vi.fn(async () => ({
      ok: false, status: 500, statusText: "ERR",
      json: async () => ({ message: "down" }),
    }));
    render(<DashboardShell>child</DashboardShell>);
    await waitFor(() => expect(useProjectStore.getState().errors.projects).toBeTruthy());
  });
});
