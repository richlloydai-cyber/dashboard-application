"use client";

// ============================================================
// HERMES DASHBOARD - LIVE PROJECT DATA HOOK
// Fetches projects + per-project pillar data exclusively from
// the live Hermes adapter API. There is NO fall-back to mock
// data — if the backend is unreachable the dashboard shows an
// explicit error state so stale/fake figures never masquerade
// as live data.
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useProjectStore } from "@/lib/store";
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

// "error" replaces the old "mock": the backend is down or returned no data.
export type DataSource = "live" | "error" | "loading";

export function useLiveProjects() {
  const setProjects = useProjectStore((s) => s.setProjects);
  const setSelectedProject = useProjectStore((s) => s.setSelectedProject);
  const selectedProject = useProjectStore((s) => s.selectedProject);
  const setError = useProjectStore((s) => s.setError);
  const [source, setSource] = useState<DataSource>("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await api.getProjects();
      if (cancelled) return;

      if (res.data && res.data.length > 0) {
        setProjects(res.data);
        setSource("live");
        setError("projects", null);
        // Always re-select from the live list. A previously persisted
        // selection (e.g. a stale mock project) must not survive when the
        // adapter is reachable.
        const stillValid = selectedProject && res.data.some((p) => p.id === selectedProject.id);
        if (!stillValid) setSelectedProject(res.data[0]!);
      } else {
        // No live data available — surface it, do NOT invent sample data.
        setError(
          "projects",
          res.error?.message ?? "No projects returned by the live adapter.",
        );
        setSource("error");
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

    // Fetch every pillar in parallel from the live adapter.
    const [pipelines, gates, envs, deployments, agents, tasks] = await Promise.all(
      [
        api.getPipelines(projectId),
        api.getQualityGates(projectId),
        api.getEnvironments(projectId),
        api.getDeployments(projectId),
        api.getAgentStatuses(projectId),
        api.getAgentTasks(projectId),
      ],
    );

    // A genuine network/HTTP failure on the core endpoint means no live data.
    if (tasks.error) {
      setData(null);
      setSource("error");
      setError(tasks.error.message);
      return;
    }

    // Live data (arrays may legitimately be empty, e.g. boards with no CI).
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
  }, [projectId]);

  useEffect(() => {
    load();

    // Poll for live updates. WebSocket/SSE aren't used in local dev (the
    // adapter serves REST only for pillar data, and polling is the most
    // robust cross-origin path). Set NEXT_PUBLIC_POLL_MS=0 to disable.
    const pollMs = Number(process.env["NEXT_PUBLIC_POLL_MS"] ?? "15000");
    if (!pollMs || Number.isNaN(pollMs)) return;

    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
  }, [load]);

  return { data, source, error, reload: load };
}
