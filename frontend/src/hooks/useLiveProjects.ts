"use client";

// ============================================================
// HERMES DASHBOARD - LIVE PROJECT DATA HOOK
// Fetches projects + per-project pillar data from the live
// Hermes adapter API, with graceful fallback to mock data
// when the backend is unreachable.
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useProjectStore } from "@/lib/store";
import {
  mockProjects,
  mockPipelines,
  mockQualityGates,
  mockEnvironments,
  mockDeployments,
  mockAgents,
  mockAgentTasks,
} from "@/lib/mock-data";
import type {
  BuildPipeline,
  QualityGate,
  Environment,
  Deployment,
  AgentStatus,
  AgentTask,
} from "@/types";

export interface ProjectPillarData {
  pipelines: BuildPipeline[];
  gates: QualityGate[];
  environments: Environment[];
  deployments: Deployment[];
  agents: AgentStatus[];
  tasks: AgentTask[];
}

export type DataSource = "live" | "mock" | "loading";

export function useLiveProjects() {
  const setProjects = useProjectStore((s) => s.setProjects);
  const setSelectedProject = useProjectStore((s) => s.setSelectedProject);
  const selectedProject = useProjectStore((s) => s.selectedProject);
  const [source, setSource] = useState<DataSource>("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await api.getProjects();
      if (cancelled) return;

      if (res.data && res.data.length > 0) {
        setProjects(res.data);
        setSource("live");
        if (!selectedProject) setSelectedProject(res.data[0]!);
      } else {
        // Backend unreachable or empty — fall back to mock data.
        setProjects(mockProjects);
        setSource("mock");
        if (!selectedProject && mockProjects.length > 0) {
          setSelectedProject(mockProjects[0]!);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { source };
}

export function useProjectPillarData(projectId: string | undefined) {
  const [data, setData] = useState<ProjectPillarData | null>(null);
  const [source, setSource] = useState<DataSource>("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) {
      setData(null);
      return;
    }
    setSource("loading");

    const [pipelines, gates, envs, deployments, agents, tasks] = await Promise.all([
      api.getPipelines(projectId),
      api.getQualityGates(projectId),
      api.getEnvironments(projectId),
      api.getDeployments(projectId),
      api.getAgentStatuses(projectId),
      api.getAgentTasks(projectId),
    ]);

    // If the tasks call succeeded (the always-present live endpoint), treat as live.
    if (tasks.data !== null) {
      setData({
        pipelines: pipelines.data ?? [],
        gates: gates.data ?? [],
        environments: envs.data ?? [],
        deployments: deployments.data ?? [],
        agents: agents.data ?? [],
        tasks: tasks.data ?? [],
      });
      setSource("live");
      setError(null);
    } else {
      // Fallback to scoped mock data.
      setData({
        pipelines: mockPipelines.filter((p) => p.projectId === projectId),
        gates: mockQualityGates.filter((g) => g.projectId === projectId),
        environments: mockEnvironments,
        deployments: mockDeployments.filter((d) => d.projectId === projectId),
        agents: mockAgents,
        tasks: mockAgentTasks.filter((t) => t.projectId === projectId),
      });
      setSource("mock");
      setError(tasks.error?.message ?? "backend unreachable");
    }
  }, [projectId]);

  useEffect(() => {
    load();

    // Poll for live updates. WebSocket/SSE aren't used in local dev (the adapter
    // serves REST + SSE only, and polling is the most robust cross-origin path).
    // Set NEXT_PUBLIC_POLL_MS=0 to disable.
    const pollMs = Number(process.env['NEXT_PUBLIC_POLL_MS'] ?? "15000");
    if (!pollMs || Number.isNaN(pollMs)) return;

    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
  }, [load]);

  return { data, source, error, reload: load };
}
