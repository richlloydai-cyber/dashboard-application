"use client";

// ============================================================
// HERMES DASHBOARD - AGENT TASK PANEL
// Pillar 1d: current Hermes agent tasks per project
// ============================================================

import { Bot, Cpu, StopCircle, CheckCircle2, XCircle, Loader2, Coins } from "lucide-react";
import { Card, Badge, Button, Progress, Avatar } from "@/components/ui";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import type { AgentStatus, AgentTask, AgentTaskStatus } from "@/types";

const AGENT_STATUS_STYLE: Record<AgentStatus["status"], { badge: "success" | "info" | "neutral" | "danger"; label: string }> = {
  busy: { badge: "info", label: "Busy" },
  idle: { badge: "success", label: "Idle" },
  offline: { badge: "neutral", label: "Offline" },
  error: { badge: "danger", label: "Error" },
};

function taskStatusBadge(s: AgentTaskStatus): "success" | "info" | "danger" | "warning" | "neutral" {
  if (s === "completed") return "success";
  if (["running", "queued", "pending", "retrying"].includes(s)) return "info";
  if (s === "failed") return "danger";
  if (["waiting_input", "paused"].includes(s)) return "warning";
  return "neutral";
}

export function AgentTaskPanel({
  agents,
  tasks,
}: {
  agents: AgentStatus[];
  tasks: AgentTask[];
}) {
  const activeTasks = tasks.filter((t) =>
    ["running", "queued", "pending", "waiting_input", "retrying"].includes(t.status)
  );
  const doneTasks = tasks.filter((t) => ["completed", "failed", "cancelled"].includes(t.status));

  return (
    <div className="space-y-4">
      {/* Agent roster */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-orange-600" />
          <h3 className="font-semibold text-text-primary">Agents</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {agents.map((agent) => {
            const style = AGENT_STATUS_STYLE[agent.status];
            return (
              <div
                key={agent.id}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3"
              >
                <Avatar name={agent.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">{agent.name}</p>
                  <p className="truncate text-xs text-text-tertiary">
                    {agent.capabilities.length} capabilities
                  </p>
                </div>
                <Badge variant={style.badge} size="sm" dot>
                  {style.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Active tasks */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-orange-600" />
            <h3 className="font-semibold text-text-primary">Active tasks</h3>
          </div>
          <Badge variant="info">{activeTasks.length}</Badge>
        </div>

        {activeTasks.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-tertiary">No active agent tasks.</p>
        ) : (
          <ul className="space-y-3">
            {activeTasks.map((task) => (
              <li key={task.id} className="rounded-lg border border-neutral-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" />
                      <p className="truncate text-sm font-medium text-text-primary">{task.title}</p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-text-tertiary">{task.description}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <Badge variant={taskStatusBadge(task.status)} size="sm">
                      {task.status}
                    </Badge>
                    <Button size="sm" variant="ghost" leftIcon={<StopCircle className="h-3.5 w-3.5" />}>
                      Stop
                    </Button>
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="mb-1 flex items-center justify-between text-xs text-text-tertiary">
                    <span>{task.currentStep ?? "Working…"}</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} size="sm" />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <Avatar name={task.agentName} size="xs" /> {task.agentName}
                  </span>
                  {task.metadata.model && <span>· {task.metadata.model}</span>}
                  {task.metadata.tokensUsed !== undefined && (
                    <span className="flex items-center gap-1">
                      <Coins className="h-3 w-3" /> {formatNumber(task.metadata.tokensUsed)} tok
                    </span>
                  )}
                  <span>· {formatRelativeTime(task.startedAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Recently completed */}
      {doneTasks.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-text-secondary">Recently completed</h3>
          <ul className="divide-y divide-neutral-100">
            {doneTasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  {task.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success-500" />
                  ) : (
                    <XCircle className="h-4 w-4 flex-shrink-0 text-danger-500" />
                  )}
                  <span className="truncate text-sm text-text-secondary">{task.title}</span>
                </div>
                <span className="flex-shrink-0 text-xs text-text-tertiary">
                  {task.agentName} · {formatRelativeTime(task.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}