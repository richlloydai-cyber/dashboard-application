import { describe, it, expect, beforeEach } from "vitest";
import { useProjectStore } from "@/lib/store";
import type { Project, AgentTask } from "@/types";

const makeProject = (id: string, overrides: Partial<Project> = {}): Project => ({
  id,
  name: id,
  displayName: id,
  description: "",
  repository: {
    provider: "local",
    url: "local",
    owner: "hermes",
    name: id,
    defaultBranch: "main",
    currentBranch: "main",
    commitSha: "",
    commitMessage: "",
    lastPush: "",
  },
  status: "active",
  pillar: "agent",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastActivity: new Date().toISOString(),
  metadata: {
    language: "N/A",
    framework: "Hermes",
    packageManager: "npm",
    nodeVersion: "20",
    dockerized: true,
    kubernetes: false,
    environments: [],
    tags: [],
    owner: "Richard Lloyd",
    team: id,
  },
  ...overrides,
});

describe("project store", () => {
  beforeEach(() => {
    // Reset to a known empty state before each test.
    useProjectStore.getState().reset();
    useProjectStore.setState({
      projects: [],
      selectedProject: null,
      pillarCache: new Map(),
      pipelines: new Map(),
      buildRuns: new Map(),
      qualityGates: new Map(),
      qualityRuns: new Map(),
      environments: new Map(),
      deployments: new Map(),
      agentTasks: new Map(),
      agentStatuses: new Map(),
      wsConnected: false,
      loading: {},
      errors: {},
    });
  });

  it("starts empty", () => {
    expect(useProjectStore.getState().projects).toEqual([]);
    expect(useProjectStore.getState().selectedProject).toBeNull();
  });

  it("setProjects + setSelectedProject", () => {
    const p = makeProject("coder-board");
    useProjectStore.getState().setProjects([p]);
    expect(useProjectStore.getState().projects).toHaveLength(1);
    useProjectStore.getState().setSelectedProject(p);
    expect(useProjectStore.getState().selectedProject?.id).toBe("coder-board");
    expect(useProjectStore.getState().ui.selectedProjectId).toBe("coder-board");
  });

  it("addProject appends", () => {
    const p = makeProject("a");
    useProjectStore.getState().addProject(p);
    expect(useProjectStore.getState().projects).toHaveLength(1);
  });

  it("updateProject merges by id", () => {
    const p = makeProject("a", { status: "active" });
    useProjectStore.getState().setProjects([p]);
    useProjectStore.getState().updateProject("a", { status: "maintenance" });
    expect(useProjectStore.getState().projects[0]!.status).toBe("maintenance");
    // selectedProject updated when it is the same id
    useProjectStore.getState().setSelectedProject(p);
    useProjectStore.getState().updateProject("a", { description: "x" });
    expect(useProjectStore.getState().selectedProject?.description).toBe("x");
  });

  it("removeProject drops by id and clears selection", () => {
    const p = makeProject("a");
    useProjectStore.getState().setProjects([p]);
    useProjectStore.getState().setSelectedProject(p);
    useProjectStore.getState().removeProject("a");
    expect(useProjectStore.getState().projects).toHaveLength(0);
    expect(useProjectStore.getState().selectedProject).toBeNull();
  });

  it("UI state setters work", () => {
    useProjectStore.getState().setSidebarOpen(false);
    expect(useProjectStore.getState().ui.sidebarOpen).toBe(false);
    useProjectStore.getState().setSelectedPillar("build");
    expect(useProjectStore.getState().ui.selectedPillar).toBe("build");
    useProjectStore.getState().setTimeRange("7d");
    expect(useProjectStore.getState().ui.timeRange).toBe("7d");
    useProjectStore.getState().setRefreshInterval(5000);
    expect(useProjectStore.getState().ui.refreshInterval).toBe(5000);
    useProjectStore.getState().setTheme("dark");
    expect(useProjectStore.getState().ui.theme).toBe("dark");
  });

  describe("pillar cache (1m TTL)", () => {
    it("stores and returns fresh data", () => {
      const data = { pipelines: [], activeRuns: [], queuedRuns: 0, successRate24h: 1, avgDuration24h: 1 } as any;
      useProjectStore.getState().setPillarData("a", "build", data);
      expect(useProjectStore.getState().getPillarData("a", "build")).toEqual(data);
    });
    it("returns null after TTL expiry", () => {
      const data = { pipelines: [] } as any;
      useProjectStore.getState().setPillarData("a", "build", data);
      // Simulate expiry by rewriting timestamp.
      const cache = useProjectStore.getState().pillarCache;
      cache.set("a:build", { data, timestamp: Date.now() - 120000 });
      useProjectStore.setState({ pillarCache: cache });
      expect(useProjectStore.getState().getPillarData("a", "build")).toBeNull();
    });
    it("invalidatePillarCache clears a pillar or all", () => {
      useProjectStore.getState().setPillarData("a", "build", {} as any);
      useProjectStore.getState().setPillarData("a", "quality", {} as any);
      useProjectStore.getState().invalidatePillarCache("a", "build");
      expect(useProjectStore.getState().getPillarData("a", "build")).toBeNull();
      expect(useProjectStore.getState().getPillarData("a", "quality")).not.toBeNull();
      useProjectStore.getState().invalidatePillarCache("a");
      expect(useProjectStore.getState().getPillarData("a", "quality")).toBeNull();
    });
  });

  describe("build data", () => {
    it("setPipelines / setBuildRuns / updateBuildRun (insert + unshift)", () => {
      useProjectStore.getState().setPipelines("a", [{ id: "p1" } as any]);
      expect(useProjectStore.getState().pipelines.get("a")).toHaveLength(1);
      useProjectStore.getState().setBuildRuns("p1", [{ id: "r1" } as any]);
      expect(useProjectStore.getState().buildRuns.get("p1")).toHaveLength(1);
      // update existing
      useProjectStore.getState().updateBuildRun("p1", { id: "r1", number: 2 } as any);
      expect(useProjectStore.getState().buildRuns.get("p1")![0]!.number).toBe(2);
      // insert new (unshift)
      useProjectStore.getState().updateBuildRun("p1", { id: "r2" } as any);
      expect(useProjectStore.getState().buildRuns.get("p1")).toHaveLength(2);
    });
  });

  describe("quality data", () => {
    it("setQualityGates / setQualityRuns / updateQualityRun", () => {
      useProjectStore.getState().setQualityGates("a", [{ id: "g1" } as any]);
      expect(useProjectStore.getState().qualityGates.get("a")).toHaveLength(1);
      useProjectStore.getState().setQualityRuns("g1", [{ id: "qr1" } as any]);
      useProjectStore.getState().updateQualityRun("g1", { id: "qr1", status: "passed" } as any);
      expect(useProjectStore.getState().qualityRuns.get("g1")![0]!.status).toBe("passed");
      useProjectStore.getState().updateQualityRun("g1", { id: "qr2" } as any);
      expect(useProjectStore.getState().qualityRuns.get("g1")).toHaveLength(2);
    });
  });

  describe("deployment data", () => {
    it("setEnvironments / setDeployments / updateDeployment", () => {
      useProjectStore.getState().setEnvironments("a", [{ id: "e1" } as any]);
      useProjectStore.getState().setDeployments("a", [{ id: "d1", projectId: "a" } as any]);
      const dep = { id: "d1", projectId: "a", status: "success" } as any;
      useProjectStore.getState().updateDeployment(dep);
      expect(useProjectStore.getState().deployments.get("a")![0]!.status).toBe("success");
      // update non-existent deployment is a no-op (no throw)
      expect(() =>
        useProjectStore.getState().updateDeployment({ id: "nope" } as any)
      ).not.toThrow();
    });
  });

  describe("agent data", () => {
    it("setAgentTasks / setAgentStatuses / update fns", () => {
      const task: AgentTask = {
        id: "t1", projectId: "a", agentId: "coder", agentName: "coder",
        type: "custom", status: "running", priority: "normal", title: "t",
        description: "", input: {}, progress: 10, steps: [], startedAt: "",
        updatedAt: "", logs: [], artifacts: [], metadata: { tags: [] },
      };
      useProjectStore.getState().setAgentTasks("a", [task]);
      useProjectStore.getState().setAgentStatuses("a", [{ id: "coder", name: "coder", type: "x", status: "busy", capabilities: [], lastHeartbeat: "" } as any]);
      // update existing task
      useProjectStore.getState().updateAgentTask("a", { ...task, progress: 50 });
      expect(useProjectStore.getState().agentTasks.get("a")![0]!.progress).toBe(50);
      // insert new task (unshift)
      useProjectStore.getState().updateAgentTask("a", { ...task, id: "t2" });
      expect(useProjectStore.getState().agentTasks.get("a")).toHaveLength(2);
      // update agent status existing + insert
      useProjectStore.getState().updateAgentStatus("a", { id: "coder", name: "coder", type: "x", status: "idle", capabilities: [], lastHeartbeat: "" } as any);
      expect(useProjectStore.getState().agentStatuses.get("a")![0]!.status).toBe("idle");
      useProjectStore.getState().updateAgentStatus("a", { id: "po", name: "po", type: "x", status: "idle", capabilities: [], lastHeartbeat: "" } as any);
      expect(useProjectStore.getState().agentStatuses.get("a")).toHaveLength(2);
    });
  });

  describe("real-time / loading / errors", () => {
    it("wsConnected toggle", () => {
      useProjectStore.getState().setWsConnected(true);
      expect(useProjectStore.getState().wsConnected).toBe(true);
    });
    it("loading + error setters/clear", () => {
      useProjectStore.getState().setLoading("x", true);
      expect(useProjectStore.getState().loading.x).toBe(true);
      useProjectStore.getState().setError("x", "boom");
      expect(useProjectStore.getState().errors.x).toBe("boom");
      useProjectStore.getState().clearError("x");
      expect(useProjectStore.getState().errors.x).toBeUndefined();
    });
    it("reset returns to initial", () => {
      useProjectStore.getState().setProjects([makeProject("a")]);
      useProjectStore.getState().reset();
      expect(useProjectStore.getState().projects).toEqual([]);
      expect(useProjectStore.getState().wsConnected).toBe(false);
    });
  });

  it("exposes selectors", () => {
    expect(useProjectStore).toBeDefined();
    expect(typeof useProjectStore.getState).toBe("function");
  });
});
