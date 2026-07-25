import { describe, it, expect, beforeEach } from "vitest";
import { useProjectStore } from "@/lib/store";
import type {
  Project,
  BuildPipeline,
  BuildRun,
  QualityGate,
  QualityRun,
  Deployment,
  Environment,
  AgentTask,
  AgentStatus,
} from "@/types";

const fullProject = (id: string, name: string): Project => ({
  id,
  name,
  displayName: name,
  description: "",
  repository: { provider: "github", url: "" },
  status: "active",
  pillar: "build",
  createdAt: "",
  updatedAt: "",
  lastActivity: "",
  metadata: { language: "", framework: "" },
});

const emptyPillarData = () => ({
  pipelines: [],
  gates: [],
  environments: [],
  deployments: [],
  agents: [],
  tasks: [],
});

describe("useProjectStore (coverage gaps)", () => {
  beforeEach(() => {
    // Clear persisted state + reset to a known-clean baseline without
    // going through the persist middleware's rehydration path.
    try {
      (globalThis as any).localStorage?.clear();
    } catch {
      /* no localStorage in jsdom — harmless */
    }
    useProjectStore.setState({
      projects: [],
      selectedProject: null,
      ui: {
        selectedProjectId: null,
        selectedPillar: "overview",
        timeRange: "24h",
        refreshInterval: 30000,
        sidebarOpen: true,
        theme: "system",
      },
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

  // addProject / updateProject / removeProject
  it("add/update/remove project", () => {
    useProjectStore.getState().addProject(fullProject("p1", "P1"));
    expect(useProjectStore.getState().projects).toHaveLength(1);

    useProjectStore.getState().updateProject("p1", { displayName: "P1-upd" });
    const updated = useProjectStore.getState().projects[0]!;
    expect(updated.displayName).toBe("P1-upd");
    expect(useProjectStore.getState().selectedProject?.displayName).toBe("P1-upd");

    useProjectStore.getState().removeProject("p1");
    expect(useProjectStore.getState().projects).toHaveLength(0);
    expect(useProjectStore.getState().selectedProject).toBeNull();
  });

  // UI setters
  it("sets UI state for sidebar/pillar/timeRange/refreshInterval/theme", () => {
    useProjectStore.getState().setSidebarOpen(false);
    expect(useProjectStore.getState().ui.sidebarOpen).toBe(false);

    useProjectStore.getState().setSelectedPillar("agent");
    expect(useProjectStore.getState().ui.selectedPillar).toBe("agent");

    useProjectStore.getState().setTimeRange("7d");
    expect(useProjectStore.getState().ui.timeRange).toBe("7d");

    useProjectStore.getState().setRefreshInterval(60000);
    expect(useProjectStore.getState().ui.refreshInterval).toBe(60000);

    useProjectStore.getState().setTheme("dark");
    expect(useProjectStore.getState().ui.theme).toBe("dark");
  });

  // Pillar cache: getPillarData hit + invalidatePillarCache both branches
  it("covers pillar cache hit and invalidate all", () => {
    useProjectStore.getState().setPillarData("p1", "build", emptyPillarData());
    const cached = useProjectStore.getState().getPillarData("p1", "build");
    expect(cached).toBeDefined();

    useProjectStore.getState().setPillarData("p1", "agent", emptyPillarData());
    useProjectStore.getState().invalidatePillarCache("p1"); // no pillar arg → delete all
    expect(useProjectStore.getState().getPillarData("p1", "build")).toBeNull();
    expect(useProjectStore.getState().getPillarData("p1", "agent")).toBeNull();
  });

  // Build data: setPipelines, setBuildRuns, updateBuildRun (update+insert)
  it("covers build data (set + update existing + new)", () => {
    useProjectStore.getState().setPipelines("p1", [{ id: "pipe", name: "Main" } as BuildPipeline]);
    expect(useProjectStore.getState().pipelines.get("p1")).toHaveLength(1);

    useProjectStore.getState().setBuildRuns("pipe", [{ id: "r1", status: "success" } as BuildRun]);
    useProjectStore.getState().updateBuildRun("pipe", { id: "r1", status: "failed" } as BuildRun);
    expect(useProjectStore.getState().buildRuns.get("pipe")?.[0]?.status).toBe("failed");

    useProjectStore.getState().updateBuildRun("pipe", { id: "r2", status: "running" } as BuildRun);
    expect(useProjectStore.getState().buildRuns.get("pipe")?.[0]?.id).toBe("r2");
  });

  // Quality data: setQualityGates + setQualityRuns + updateQualityRun (update+insert)
  it("covers quality data (set + update existing + new)", () => {
    useProjectStore.getState().setQualityGates("p1", [{ id: "gate", name: "Test" } as QualityGate]);
    expect(useProjectStore.getState().qualityGates.get("p1")).toHaveLength(1);

    useProjectStore.getState().setQualityRuns("gate", [{ id: "qr1", status: "passed" } as QualityRun]);
    useProjectStore.getState().updateQualityRun("gate", { id: "qr1", status: "failed" } as QualityRun);
    expect(useProjectStore.getState().qualityRuns.get("gate")?.[0]?.status).toBe("failed");

    useProjectStore.getState().updateQualityRun("gate", { id: "qr2", status: "passed" } as QualityRun);
    expect(useProjectStore.getState().qualityRuns.get("gate")?.[0]?.id).toBe("qr2");
  });

  // Deployment data: setEnvironments, setDeployments, updateDeployment
  it("covers deployment data", () => {
    useProjectStore.getState().setEnvironments("p1", [{ id: "env", name: "prod" } as Environment]);
    expect(useProjectStore.getState().environments.get("p1")).toHaveLength(1);

    useProjectStore.getState().setDeployments("p1", [{ id: "d1", version: "v1.0.0" } as Deployment]);
    useProjectStore.getState().updateDeployment({ id: "d1", version: "v2.0.0" } as Deployment);
    expect(useProjectStore.getState().deployments.get("p1")?.[0]?.version).toBe("v2.0.0");
  });

  // Agent data: setAgentTasks, setAgentStatuses + updateAgentTask + updateAgentStatus (update+insert)
  it("covers agent data (update existing + new status)", () => {
    useProjectStore.getState().setAgentTasks("p1", [{ id: "t1", status: "running" } as AgentTask]);
    expect(useProjectStore.getState().agentTasks.get("p1")).toHaveLength(1);

    useProjectStore.getState().updateAgentTask("p1", { id: "t1", status: "completed" } as AgentTask);
    expect(useProjectStore.getState().agentTasks.get("p1")?.[0]?.status).toBe("completed");

    useProjectStore.getState().setAgentStatuses("p1", [{ id: "a1", status: "idle" } as AgentStatus]);

    useProjectStore.getState().updateAgentStatus("p1", { id: "a1", status: "busy" } as AgentStatus);
    expect(useProjectStore.getState().agentStatuses.get("p1")?.[0]?.status).toBe("busy");

    useProjectStore.getState().updateAgentStatus("p1", { id: "a2", status: "error" } as AgentStatus);
    expect(useProjectStore.getState().agentStatuses.get("p1")?.length).toBe(2);
  });

  // Loading, errors, wsConnected
  it("covers loading/error/wsConnected setters", () => {
    useProjectStore.getState().setLoading("foo", true);
    expect(useProjectStore.getState().loading.foo).toBe(true);

    useProjectStore.getState().setError("bar", "Oops");
    expect(useProjectStore.getState().errors.bar).toBe("Oops");

    useProjectStore.getState().clearError("bar");
    expect(useProjectStore.getState().errors.bar).toBeUndefined();

    useProjectStore.getState().setWsConnected(true);
    expect(useProjectStore.getState().wsConnected).toBe(true);
  });
});
