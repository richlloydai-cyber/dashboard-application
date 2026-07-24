import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BuildPipelinePanel } from "@/components/projects/BuildPipelinePanel";
import type { BuildPipeline } from "@/types";

const pipe = (over: Partial<BuildPipeline> = {}): BuildPipeline => ({
  id: "p1", projectId: "coder-board", name: "CI", status: "success",
  currentRun: {
    id: "r1", pipelineId: "p1", number: 13, status: "success", trigger: { type: "push" },
    branch: "main",
    commit: { sha: "abc", shortSha: "abc", message: "feat", author: { name: "R", email: "r@x" }, timestamp: "2026-01-01T00:00:00Z", url: "" },
    startedAt: "2026-01-01T00:00:00Z",
    stages: [
      { stageId: "s1", name: "typecheck", status: "success", startedAt: "2026-01-01T00:00:00Z", jobs: [] },
      { stageId: "s2", name: "build", status: "running", jobs: [] },
    ],
    artifacts: [],
  },
  recentRuns: [], stages: [], triggers: [{ type: "push", branches: ["main"] }],
  metrics: { totalRuns: 13, successRate: 1, averageDuration: 1000, trend: "stable" },
  ...over,
});

describe("<BuildPipelinePanel />", () => {
  it("shows empty state when no pipelines", () => {
    render(<BuildPipelinePanel pipelines={[]} />);
    expect(screen.getByText(/No pipelines configured/)).toBeInTheDocument();
  });

  it("renders pipeline name + run number + stages", () => {
    render(<BuildPipelinePanel pipelines={[pipe()]} />);
    expect(screen.getByText("CI")).toBeInTheDocument();
    expect(screen.getByText("#13")).toBeInTheDocument();
    expect(screen.getByText("typecheck")).toBeInTheDocument();
    expect(screen.getByText("build")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders multiple pipelines", () => {
    render(<BuildPipelinePanel pipelines={[pipe({ id: "a" }), pipe({ id: "b", name: "Other" })]} />);
    expect(screen.getByText("CI")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });
});
