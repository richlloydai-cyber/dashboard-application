import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QualityGatePanel } from "@/components/projects/QualityGatePanel";
import type { QualityGate } from "@/types";

const gate = (over: Partial<QualityGate> = {}): QualityGate => ({
  id: "g1", projectId: "coder-board", name: "Gate", status: "passed",
  rules: [],
  lastRun: {
    id: "qr1", gateId: "g1", status: "passed",
    startedAt: "2026-01-01T00:00:00Z", finishedAt: "2026-01-01T00:00:01Z", duration: 1000,
    results: [
      { ruleId: "r1", ruleName: "Coverage", metric: "coverage", value: 92, threshold: 90, operator: "gte", passed: true, severity: "error" },
      { ruleId: "r2", ruleName: "Lint", metric: "errors", value: 3, threshold: 0, operator: "lte", passed: false, severity: "warning" },
    ],
    summary: { totalRules: 2, passed: 1, failed: 1, warnings: 0, skipped: 0, overallScore: 80 },
  },
  history: [],
  thresholds: { coverage: { minimum: 90, target: 95 }, duplication: { maximum: 3 }, complexity: { maximum: 15 }, maintainability: { minimum: 80 }, security: { critical: 0, high: 0, medium: 5, low: 20 } },
  ...over,
});

describe("<QualityGatePanel />", () => {
  it("shows empty state when no gates", () => {
    render(<QualityGatePanel gates={[]} />);
    expect(screen.getByText(/No quality gates configured/)).toBeInTheDocument();
  });

  it("renders gate name, score, rule summary + rows", () => {
    render(<QualityGatePanel gates={[gate()]} />);
    expect(screen.getByText("Gate")).toBeInTheDocument();
    expect(screen.getByText("80/100")).toBeInTheDocument();
    expect(screen.getByText("Coverage")).toBeInTheDocument();
    expect(screen.getByText("Lint")).toBeInTheDocument();
    expect(screen.getByText("Passed")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("renders multiple gates", () => {
    render(<QualityGatePanel gates={[gate(), gate({ id: "g2", name: "Second" })]} />);
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
