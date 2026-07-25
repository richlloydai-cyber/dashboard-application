import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useProjectStore } from "@/lib/store";
import type { Project } from "@/types";

const p = (id: string, status: Project["status"] = "active"): Project => ({
  id, name: id, displayName: id, description: "",
  repository: { provider: "local", url: "local", owner: "h", name: id, defaultBranch: "main", currentBranch: "main", commitSha: "", commitMessage: "", lastPush: "" },
  status, pillar: "agent",
  createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z", lastActivity: "2026-01-01T00:00:00Z",
  metadata: { language: "N/A", framework: "Hermes", packageManager: "npm", nodeVersion: "20", dockerized: true, kubernetes: false, environments: [], tags: [], owner: "R", team: id },
});

describe("<Sidebar />", () => {
  beforeEach(() => useProjectStore.getState().reset());

  it("renders pillar nav + project count", () => {
    useProjectStore.getState().setProjects([p("coder-board"), p("product-board", "inactive")]);
    render(<Sidebar />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Build Pipelines")).toBeInTheDocument();
    expect(screen.getByText(/Projects \(2\)/)).toBeInTheDocument();
  });

  it("renders each project with display name", () => {
    useProjectStore.getState().setProjects([p("coder-board")]);
    render(<Sidebar />);
    expect(screen.getByText("coder-board")).toBeInTheDocument();
  });

  it("selects a project on click", () => {
    const proj = p("coder-board");
    useProjectStore.getState().setProjects([proj]);
    render(<Sidebar />);
    fireEvent.click(screen.getByText("coder-board"));
    expect(useProjectStore.getState().selectedProject?.id).toBe("coder-board");
  });

  it("highlights the active pillar + project", () => {
    useProjectStore.getState().setProjects([p("coder-board")]);
    useProjectStore.getState().setSelectedProject(p("coder-board"));
    useProjectStore.getState().setSelectedPillar("build");
    render(<Sidebar />);
    const buildBtn = screen.getByText("Build Pipelines").closest("button")!;
    expect(buildBtn.className).toContain("bg-primary-50");
  });

  it("toggles sidebar open state via backdrop", () => {
    useProjectStore.getState().setSidebarOpen(true);
    const { container } = render(<Sidebar />);
    const backdrop = container.querySelector<HTMLElement>("[aria-hidden='true']")!;
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop);
    expect(useProjectStore.getState().ui.sidebarOpen).toBe(false);
  });
});
