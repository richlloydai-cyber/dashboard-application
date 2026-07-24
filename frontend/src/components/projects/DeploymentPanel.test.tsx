import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeploymentPanel } from "@/components/projects/DeploymentPanel";
import type { Deployment, Environment } from "@/types";

const env = (over: Partial<Environment> = {}): Environment => ({
  id: "dev", name: "development", type: "development", replicas: 1,
  protected: false, approvalRequired: false, variables: {}, secrets: [], ...over,
});

const dep = (over: Partial<Deployment> = {}): Deployment => ({
  id: "d1", projectId: "coder-board", environment: env(),
  status: "success", strategy: "rolling", version: "v1.2.3",
  trigger: { type: "auto" }, startedAt: "2026-01-01T00:00:00Z",
  deployedBy: { name: "hermes", email: "h@x" },
  steps: [], healthChecks: [{ id: "h1", name: "HTTP health", type: "http", endpoint: "/health", expectedStatus: 200, timeout: 5, interval: 30, retries: 3, status: "passing" }],
  metrics: { downtime: 0, rollbackCount: 0, successRate: 1, averageDuration: 1000 },
  ...over,
});

describe("<DeploymentPanel />", () => {
  it("renders environments + a deployment with health check", () => {
    render(<DeploymentPanel environments={[env(), env({ id: "prod", name: "production", type: "production", protected: true, approvalRequired: true })]} deployments={[dep()]} />);
    expect(screen.getByText("development")).toBeInTheDocument();
    expect(screen.getByText("production")).toBeInTheDocument();
    expect(screen.getByText("v1.2.3")).toBeInTheDocument();
    expect(screen.getByText("HTTP health")).toBeInTheDocument();
    // Rollback button shows for success
    expect(screen.getByText("Rollback")).toBeInTheDocument();
  });

  it("shows 'No deployments' when an env has none", () => {
    render(<DeploymentPanel environments={[env({ id: "stg", name: "staging", type: "staging" })]} deployments={[]} />);
    expect(screen.getByText(/No deployments/)).toBeInTheDocument();
  });

  it("handles multiple deployments", () => {
    render(<DeploymentPanel environments={[env()]} deployments={[dep(), dep({ id: "d2", version: "v2" })]} />);
    expect(screen.getByText("v2")).toBeInTheDocument();
  });
});
