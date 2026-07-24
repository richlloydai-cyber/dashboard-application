// ============================================================
// HERMES DASHBOARD - ZUSTAND STORE
// Global state management for dashboard
// ============================================================

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
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
  Pillar,
  TimeRange,
  DashboardState,
  PillarData,
} from "@/types";

interface ProjectStore {
  // Projects
  projects: Project[];
  selectedProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;

  // UI State
  ui: DashboardState;
  setSidebarOpen: (open: boolean) => void;
  setSelectedPillar: (pillar: Pillar | "overview") => void;
  setTimeRange: (range: TimeRange) => void;
  setRefreshInterval: (interval: number) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Pillar Data Cache
  pillarCache: Map<string, { data: PillarData; timestamp: number }>;
  getPillarData: (projectId: string, pillar: Pillar) => PillarData | null;
  setPillarData: (projectId: string, pillar: Pillar, data: PillarData) => void;
  invalidatePillarCache: (projectId: string, pillar?: Pillar) => void;

  // Build Data
  pipelines: Map<string, BuildPipeline[]>;
  buildRuns: Map<string, BuildRun[]>;
  setPipelines: (projectId: string, pipelines: BuildPipeline[]) => void;
  setBuildRuns: (pipelineId: string, runs: BuildRun[]) => void;
  updateBuildRun: (pipelineId: string, run: BuildRun) => void;

  // Quality Data
  qualityGates: Map<string, QualityGate[]>;
  qualityRuns: Map<string, QualityRun[]>;
  setQualityGates: (projectId: string, gates: QualityGate[]) => void;
  setQualityRuns: (gateId: string, runs: QualityRun[]) => void;
  updateQualityRun: (gateId: string, run: QualityRun) => void;

  // Deployment Data
  environments: Map<string, Environment[]>;
  deployments: Map<string, Deployment[]>;
  setEnvironments: (projectId: string, environments: Environment[]) => void;
  setDeployments: (projectId: string, deployments: Deployment[]) => void;
  updateDeployment: (deployment: Deployment) => void;

  // Agent Data
  agentTasks: Map<string, AgentTask[]>;
  agentStatuses: Map<string, AgentStatus[]>;
  setAgentTasks: (projectId: string, tasks: AgentTask[]) => void;
  setAgentStatuses: (projectId: string, statuses: AgentStatus[]) => void;
  updateAgentTask: (projectId: string, task: AgentTask) => void;
  updateAgentStatus: (projectId: string, status: AgentStatus) => void;

  // Real-time connection
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;

  // Loading states
  loading: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;

  // Errors
  errors: Record<string, string | null>;
  setError: (key: string, error: string | null) => void;
  clearError: (key: string) => void;

  // Reset
  reset: () => void;
}

const initialUIState: DashboardState = {
  selectedProjectId: null,
  selectedPillar: "overview",
  timeRange: "24h",
  refreshInterval: 30000,
  sidebarOpen: true,
  theme: "system",
};

export const useProjectStore = create<ProjectStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Projects
        projects: [],
        selectedProject: null,
        setProjects: (projects) => set({ projects }),
        setSelectedProject: (project) =>
          set({
            selectedProject: project,
            ui: { ...get().ui, selectedProjectId: project?.id || null },
          }),
        addProject: (project) =>
          set((state) => ({ projects: [...state.projects, project] })),
        updateProject: (id, updates) =>
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
            selectedProject:
              state.selectedProject?.id === id
                ? { ...state.selectedProject, ...updates }
                : state.selectedProject,
          })),
        removeProject: (id) =>
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            selectedProject:
              state.selectedProject?.id === id ? null : state.selectedProject,
          })),

        // UI State
        ui: initialUIState,
        setSidebarOpen: (sidebarOpen) =>
          set((state) => ({ ui: { ...state.ui, sidebarOpen } })),
        setSelectedPillar: (selectedPillar) =>
          set((state) => ({ ui: { ...state.ui, selectedPillar } })),
        setTimeRange: (timeRange) =>
          set((state) => ({ ui: { ...state.ui, timeRange } })),
        setRefreshInterval: (refreshInterval) =>
          set((state) => ({ ui: { ...state.ui, refreshInterval } })),
        setTheme: (theme) =>
          set((state) => ({ ui: { ...state.ui, theme } })),

        // Pillar Data Cache
        pillarCache: new Map(),
        getPillarData: (projectId, pillar) => {
          const key = `${projectId}:${pillar}`;
          const cached = get().pillarCache.get(key);
          if (cached && Date.now() - cached.timestamp < 60000) {
            return cached.data;
          }
          return null;
        },
        setPillarData: (projectId, pillar, data) =>
          set((state) => {
            const newCache = new Map(state.pillarCache);
            newCache.set(`${projectId}:${pillar}`, { data, timestamp: Date.now() });
            return { pillarCache: newCache };
          }),
        invalidatePillarCache: (projectId, pillar) =>
          set((state) => {
            const newCache = new Map(state.pillarCache);
            if (pillar) {
              newCache.delete(`${projectId}:${pillar}`);
            } else {
              // Delete all pillars for this project
              for (const key of newCache.keys()) {
                if (key.startsWith(`${projectId}:`)) {
                  newCache.delete(key);
                }
              }
            }
            return { pillarCache: newCache };
          }),

        // Build Data
        pipelines: new Map(),
        buildRuns: new Map(),
        setPipelines: (projectId, pipelines) =>
          set((state) => {
            const newMap = new Map(state.pipelines);
            newMap.set(projectId, pipelines);
            return { pipelines: newMap };
          }),
        setBuildRuns: (pipelineId, runs) =>
          set((state) => {
            const newMap = new Map(state.buildRuns);
            newMap.set(pipelineId, runs);
            return { buildRuns: newMap };
          }),
        updateBuildRun: (pipelineId, run) =>
          set((state) => {
            const newMap = new Map(state.buildRuns);
            const runs = newMap.get(pipelineId) || [];
            const index = runs.findIndex((r) => r.id === run.id);
            if (index >= 0) {
              runs[index] = run;
            } else {
              runs.unshift(run);
            }
            newMap.set(pipelineId, runs);
            return { buildRuns: newMap };
          }),

        // Quality Data
        qualityGates: new Map(),
        qualityRuns: new Map(),
        setQualityGates: (projectId, gates) =>
          set((state) => {
            const newMap = new Map(state.qualityGates);
            newMap.set(projectId, gates);
            return { qualityGates: newMap };
          }),
        setQualityRuns: (gateId, runs) =>
          set((state) => {
            const newMap = new Map(state.qualityRuns);
            newMap.set(gateId, runs);
            return { qualityRuns: newMap };
          }),
        updateQualityRun: (gateId, run) =>
          set((state) => {
            const newMap = new Map(state.qualityRuns);
            const runs = newMap.get(gateId) || [];
            const index = runs.findIndex((r) => r.id === run.id);
            if (index >= 0) {
              runs[index] = run;
            } else {
              runs.unshift(run);
            }
            newMap.set(gateId, runs);
            return { qualityRuns: newMap };
          }),

        // Deployment Data
        environments: new Map(),
        deployments: new Map(),
        setEnvironments: (projectId, environments) =>
          set((state) => {
            const newMap = new Map(state.environments);
            newMap.set(projectId, environments);
            return { environments: newMap };
          }),
        setDeployments: (projectId, deployments) =>
          set((state) => {
            const newMap = new Map(state.deployments);
            newMap.set(projectId, deployments);
            return { deployments: newMap };
          }),
        updateDeployment: (deployment) =>
          set((state) => {
            const newMap = new Map(state.deployments);
            for (const [projectId, deployments] of newMap.entries()) {
              const index = deployments.findIndex((d) => d.id === deployment.id);
              if (index >= 0) {
                deployments[index] = deployment;
                newMap.set(projectId, deployments);
                break;
              }
            }
            return { deployments: newMap };
          }),

        // Agent Data
        agentTasks: new Map(),
        agentStatuses: new Map(),
        setAgentTasks: (projectId, tasks) =>
          set((state) => {
            const newMap = new Map(state.agentTasks);
            newMap.set(projectId, tasks);
            return { agentTasks: newMap };
          }),
        setAgentStatuses: (projectId, statuses) =>
          set((state) => {
            const newMap = new Map(state.agentStatuses);
            newMap.set(projectId, statuses);
            return { agentStatuses: newMap };
          }),
        updateAgentTask: (projectId, task) =>
          set((state) => {
            const newMap = new Map(state.agentTasks);
            const tasks = newMap.get(projectId) || [];
            const index = tasks.findIndex((t) => t.id === task.id);
            if (index >= 0) {
              tasks[index] = task;
            } else {
              tasks.unshift(task);
            }
            newMap.set(projectId, tasks);
            return { agentTasks: newMap };
          }),
        updateAgentStatus: (projectId, status) =>
          set((state) => {
            const newMap = new Map(state.agentStatuses);
            const statuses = newMap.get(projectId) || [];
            const index = statuses.findIndex((s) => s.id === status.id);
            if (index >= 0) {
              statuses[index] = status;
            } else {
              statuses.push(status);
            }
            newMap.set(projectId, statuses);
            return { agentStatuses: newMap };
          }),

        // Real-time
        wsConnected: false,
        setWsConnected: (connected) => set({ wsConnected: connected }),

        // Loading states
        loading: {},
        setLoading: (key, loading) =>
          set((state) => ({
            loading: { ...state.loading, [key]: loading },
          })),

        // Errors
        errors: {},
        setError: (key, error) =>
          set((state) => ({
            errors: { ...state.errors, [key]: error },
          })),
        clearError: (key) =>
          set((state) => {
            const newErrors = { ...state.errors };
            delete newErrors[key];
            return { errors: newErrors };
          }),

        // Reset
        reset: () =>
          set({
            projects: [],
            selectedProject: null,
            ui: initialUIState,
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
          }),
      }),
      {
        name: "hermes-dashboard-store",
        partialize: (state) => ({
          ui: state.ui,
          projects: state.projects,
        }),
      }
    ),
    { name: "ProjectStore" }
  )
);

// Selectors for common use cases
export const useProjects = () => useProjectStore((state) => state.projects);
export const useSelectedProject = () => useProjectStore((state) => state.selectedProject);
export const useSelectedProjectId = () => useProjectStore((state) => state.ui.selectedProjectId);
export const useSidebarOpen = () => useProjectStore((state) => state.ui.sidebarOpen);
export const useSelectedPillar = () => useProjectStore((state) => state.ui.selectedPillar);
export const useTimeRange = () => useProjectStore((state) => state.ui.timeRange);
export const useTheme = () => useProjectStore((state) => state.ui.theme);
export const useWsConnected = () => useProjectStore((state) => state.wsConnected);
export const useLoading = (key: string) => useProjectStore((state) => state.loading[key]);
export const useError = (key: string) => useProjectStore((state) => state.errors[key]);