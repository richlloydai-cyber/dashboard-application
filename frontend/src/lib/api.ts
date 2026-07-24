// ============================================================
// HERMES DASHBOARD - API CLIENT
// Centralized API client with WebSocket/SSE support
// ============================================================

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
  PillarData,
  ProjectDashboardData,
  DashboardEvent,
  ApiResponse,
  TimeRange,
} from "@/types";

// In local standalone mode, set NEXT_PUBLIC_API_URL to the adapter/tunnel URL
// (e.g. https://xxx.trycloudflare.com). Behind nginx it stays "/projects/api".
const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || "/projects/api";
const WS_URL = process.env['NEXT_PUBLIC_WS_URL'] || "/projects/ws";

class ApiClient {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, Set<(event: DashboardEvent) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            code: `HTTP_${response.status}`,
            message: data.message || response.statusText,
            details: data,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            version: "1.0",
          },
        };
      }

      return {
        data: data.data || data,
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          version: "1.0",
        },
      };
    } catch (error) {
      return {
        data: null,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          version: "1.0",
        },
      };
    }
  }

  // ============================================================
  // PROJECTS
  // ============================================================

  async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>("/projects");
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${id}`);
  }

  async getProjectDashboard(
    id: string,
    timeRange: TimeRange = "24h"
  ): Promise<ApiResponse<ProjectDashboardData>> {
    return this.request<ProjectDashboardData>(`/projects/${id}/dashboard?range=${timeRange}`);
  }

  // ============================================================
  // BUILD PIPELINES
  // ============================================================

  async getPipelines(projectId: string): Promise<ApiResponse<BuildPipeline[]>> {
    return this.request<BuildPipeline[]>(`/projects/${projectId}/pipelines`);
  }

  async getPipeline(projectId: string, pipelineId: string): Promise<ApiResponse<BuildPipeline>> {
    return this.request<BuildPipeline>(`/projects/${projectId}/pipelines/${pipelineId}`);
  }

  async getBuildRuns(
    projectId: string,
    pipelineId: string,
    limit = 20
  ): Promise<ApiResponse<BuildRun[]>> {
    return this.request<BuildRun[]>(
      `/projects/${projectId}/pipelines/${pipelineId}/runs?limit=${limit}`
    );
  }

  async getBuildRun(
    projectId: string,
    pipelineId: string,
    runId: string
  ): Promise<ApiResponse<BuildRun>> {
    return this.request<BuildRun>(
      `/projects/${projectId}/pipelines/${pipelineId}/runs/${runId}`
    );
  }

  async triggerBuild(
    projectId: string,
    pipelineId: string,
    options: { branch?: string; variables?: Record<string, string> } = {}
  ): Promise<ApiResponse<BuildRun>> {
    return this.request<BuildRun>(`/projects/${projectId}/pipelines/${pipelineId}/trigger`, {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  async cancelBuild(
    projectId: string,
    pipelineId: string,
    runId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/projects/${projectId}/pipelines/${pipelineId}/runs/${runId}/cancel`, {
      method: "POST",
    });
  }

  // ============================================================
  // QUALITY GATES
  // ============================================================

  async getQualityGates(projectId: string): Promise<ApiResponse<QualityGate[]>> {
    return this.request<QualityGate[]>(`/projects/${projectId}/quality-gates`);
  }

  async getQualityGate(projectId: string, gateId: string): Promise<ApiResponse<QualityGate>> {
    return this.request<QualityGate>(`/projects/${projectId}/quality-gates/${gateId}`);
  }

  async getQualityRuns(
    projectId: string,
    gateId: string,
    limit = 20
  ): Promise<ApiResponse<QualityRun[]>> {
    return this.request<QualityRun[]>(
      `/projects/${projectId}/quality-gates/${gateId}/runs?limit=${limit}`
    );
  }

  async triggerQualityScan(
    projectId: string,
    gateId: string
  ): Promise<ApiResponse<QualityRun>> {
    return this.request<QualityRun>(
      `/projects/${projectId}/quality-gates/${gateId}/scan`,
      { method: "POST" }
    );
  }

  // ============================================================
  // DEPLOYMENTS
  // ============================================================

  async getEnvironments(projectId: string): Promise<ApiResponse<Environment[]>> {
    return this.request<Environment[]>(`/projects/${projectId}/environments`);
  }

  async getDeployments(
    projectId: string,
    environmentId?: string,
    limit = 20
  ): Promise<ApiResponse<Deployment[]>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (environmentId) params.append("environment", environmentId);
    return this.request<Deployment[]>(`/projects/${projectId}/deployments?${params}`);
  }

  async getDeployment(
    projectId: string,
    deploymentId: string
  ): Promise<ApiResponse<Deployment>> {
    return this.request<Deployment>(`/projects/${projectId}/deployments/${deploymentId}`);
  }

  async triggerDeployment(
    projectId: string,
    environmentId: string,
    options: { version: string; buildId?: string; strategy?: string } = { version: "" }
  ): Promise<ApiResponse<Deployment>> {
    return this.request<Deployment>(
      `/projects/${projectId}/environments/${environmentId}/deploy`,
      {
        method: "POST",
        body: JSON.stringify(options),
      }
    );
  }

  async rollbackDeployment(
    projectId: string,
    deploymentId: string
  ): Promise<ApiResponse<Deployment>> {
    return this.request<Deployment>(
      `/projects/${projectId}/deployments/${deploymentId}/rollback`,
      { method: "POST" }
    );
  }

  async approveDeployment(
    projectId: string,
    deploymentId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      `/projects/${projectId}/deployments/${deploymentId}/approve`,
      { method: "POST" }
    );
  }

  // ============================================================
  // AGENT TASKS
  // ============================================================

  async getAgentTasks(
    projectId: string,
    status?: string,
    limit = 20
  ): Promise<ApiResponse<AgentTask[]>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (status) params.append("status", status);
    return this.request<AgentTask[]>(`/projects/${projectId}/agent-tasks?${params}`);
  }

  async getAgentTask(projectId: string, taskId: string): Promise<ApiResponse<AgentTask>> {
    return this.request<AgentTask>(`/projects/${projectId}/agent-tasks/${taskId}`);
  }

  async getAgentStatuses(projectId: string): Promise<ApiResponse<AgentStatus[]>> {
    return this.request<AgentStatus[]>(`/projects/${projectId}/agents`);
  }

  async triggerAgentTask(
    projectId: string,
    type: string,
    input: Record<string, unknown>
  ): Promise<ApiResponse<AgentTask>> {
    return this.request<AgentTask>(`/projects/${projectId}/agent-tasks`, {
      method: "POST",
      body: JSON.stringify({ type, input }),
    });
  }

  async cancelAgentTask(projectId: string, taskId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/projects/${projectId}/agent-tasks/${taskId}/cancel`, {
      method: "POST",
    });
  }

  // ============================================================
  // PILLAR DATA
  // ============================================================

  async getPillarData(
    projectId: string,
    pillar: "build" | "quality" | "deploy" | "agent",
    timeRange: TimeRange = "24h"
  ): Promise<ApiResponse<PillarData>> {
    return this.request<PillarData>(
      `/projects/${projectId}/pillars/${pillar}?range=${timeRange}`
    );
  }

  // ============================================================
  // WEBSOCKET / REAL-TIME
  // ============================================================

  connect(projectId?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const url = new URL(WS_URL, window.location.origin);
    if (projectId) url.searchParams.set("project", projectId);

    this.ws = new WebSocket(url.toString());

    this.ws.onopen = () => {
      console.log("[WS] Connected");
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message: DashboardEvent = JSON.parse(event.data);
        this.dispatchEvent(message);
      } catch (error) {
        console.error("[WS] Failed to parse message:", error);
      }
    };

    this.ws.onclose = () => {
      console.log("[WS] Disconnected");
      this.attemptReconnect(projectId);
    };

    this.ws.onerror = (error) => {
      console.error("[WS] Error:", error);
    };
  }

  private attemptReconnect(projectId?: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[WS] Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => this.connect(projectId), delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.eventHandlers.clear();
  }

  on<T extends DashboardEvent["type"]>(
    type: T,
    handler: (event: Extract<DashboardEvent, { type: T }>) => void
  ): () => void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }
    this.eventHandlers.get(type)!.add(handler as (event: DashboardEvent) => void);

    return () => {
      this.eventHandlers.get(type)?.delete(handler as (event: DashboardEvent) => void);
    };
  }

  private dispatchEvent(event: DashboardEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[WS] Handler error for ${event.type}:`, error);
        }
      });
    }

    // Also dispatch to wildcard handlers
    const wildcardHandlers = this.eventHandlers.get("*");
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error("[WS] Wildcard handler error:", error);
        }
      });
    }
  }

  send(message: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const api = new ApiClient();

// React hooks for data fetching
export function useApi() {
  return api;
}