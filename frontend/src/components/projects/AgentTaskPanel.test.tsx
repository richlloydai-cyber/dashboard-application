import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentTaskPanel } from "@/components/projects/AgentTaskPanel";
import type { AgentStatus, AgentTask } from "@/types";

const agent = (over: Partial<AgentStatus> = {}): AgentStatus => ({
  id: "coder", name: "Coder", type: "code", status: "busy",
  capabilities: ["refactor", "test_generation"], lastHeartbeat: "2026-01-01T00:00:00Z", ...over,
});

const task = (over: Partial<AgentTask> = {}): AgentTask => ({
  id: "t1", projectId: "coder-board", agentId: "coder", agentName: "Coder",
  type: "custom", status: "running", priority: "high", title: "Fix the thing",
  description: "Details", input: {}, progress: 42, currentStep: "Working",
  steps: [], startedAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  logs: [], artifacts: [], metadata: { model: "deepseek-v4-flash", tokensUsed: 1234, tags: ["x"] },
  ...over,
});

describe("<AgentTaskPanel />", () => {
  it("renders the agent roster + active tasks", () => {
    render(<AgentTaskPanel agents={[agent(), agent({ id: "po", name: "PO", status: "idle" })]} tasks={[task()]} />);
    expect(screen.getByText("Coder")).toBeInTheDocument();
    expect(screen.getByText("PO")).toBeInTheDocument();
    expect(screen.getByText("Active tasks")).toBeInTheDocument();
    expect(screen.getByText("Fix the thing")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByText(/1.2K tok/)).toBeInTheDocument();
  });

  it("shows 'No active agent tasks' when none active", () => {
    render(<AgentTaskPanel agents={[agent()]} tasks={[task({ status: "completed" })]} />);
    expect(screen.getByText(/No active agent tasks/)).toBeInTheDocument();
    expect(screen.getByText("Recently completed")).toBeInTheDocument();
  });

  it("renders completed tasks section", () => {
    render(<AgentTaskPanel agents={[agent()]} tasks={[task({ id: "t2", status: "completed", title: "Done job" })]} />);
    expect(screen.getByText("Done job")).toBeInTheDocument();
  });
});
