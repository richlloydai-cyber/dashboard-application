"use client";

// ============================================================
// HERMES DASHBOARD - DEPLOYMENT PANEL
// Pillar 1c: environments + deployment status + health checks
// ============================================================

import { Rocket, RotateCcw, CheckCircle2, Server, ShieldQuestion, ExternalLink } from "lucide-react";
import { Card, Badge, Button, StatusIndicator } from "@/components/ui";
import { cn, formatDuration, formatRelativeTime } from "@/lib/utils";
import type { Deployment, DeploymentStatus, Environment } from "@/types";

const ENV_STYLE: Record<Environment["type"], string> = {
  production: "bg-danger-50 text-danger-700 border-danger-200",
  staging: "bg-warning-50 text-warning-700 border-warning-200",
  development: "bg-primary-50 text-primary-700 border-primary-200",
  preview: "bg-purple-50 text-purple-700 border-purple-200",
  canary: "bg-orange-50 text-orange-700 border-orange-200",
};

function statusBadge(status: DeploymentStatus): "success" | "info" | "danger" | "warning" | "neutral" {
  if (status === "success") return "success";
  if (["deploying", "building", "verifying", "queued", "pending"].includes(status)) return "info";
  if (["failed", "rolled_back"].includes(status)) return "danger";
  if (status === "paused") return "warning";
  return "neutral";
}

export function DeploymentPanel({
  environments,
  deployments,
}: {
  environments: Environment[];
  deployments: Deployment[];
}) {
  return (
    <div className="space-y-4">
      {/* Environment strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {environments.map((env) => {
          const latest = deployments.find((d) => d.environment.id === env.id);
          return (
            <Card key={env.id} padding="sm">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                    ENV_STYLE[env.type]
                  )}
                >
                  {env.name}
                </span>
                {env.approvalRequired && (
                  <ShieldQuestion className="h-4 w-4 text-warning-500" aria-label="Approval required" />
                )}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm">
                <Server className="h-3.5 w-3.5 text-text-tertiary" />
                <span className="text-text-secondary">{env.replicas} replica{env.replicas !== 1 && "s"}</span>
              </div>
              {latest ? (
                <div className="mt-2 flex items-center justify-between">
                  <code className="text-xs font-medium text-text-primary">{latest.version}</code>
                  <StatusIndicator status={latest.status} label={latest.status} size="sm" />
                </div>
              ) : (
                <p className="mt-2 text-xs text-text-tertiary">No deployments</p>
              )}
              {env.url && (
                <a
                  href={env.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center gap-1 text-xs text-primary-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {env.url.replace(/^https?:\/\//, "")}
                </a>
              )}
            </Card>
          );
        })}
      </div>

      {/* Recent deployments */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Rocket className="h-4 w-4 text-purple-600" />
          <h3 className="font-semibold text-text-primary">Recent deployments</h3>
        </div>
        <ul className="divide-y divide-neutral-100">
          {deployments.map((dep) => (
            <li key={dep.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-medium text-text-primary">{dep.version}</code>
                  <Badge variant={statusBadge(dep.status)} size="sm" dot>
                    {dep.status}
                  </Badge>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-xs font-medium",
                      ENV_STYLE[dep.environment.type]
                    )}
                  >
                    {dep.environment.name}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {dep.strategy} · by {dep.deployedBy.name} · {formatRelativeTime(dep.startedAt)}
                  {dep.duration && ` · ${formatDuration(dep.duration)}`}
                </p>
                {/* Health checks */}
                {dep.healthChecks.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {dep.healthChecks.map((hc) => (
                      <span
                        key={hc.id}
                        className={cn(
                          "flex items-center gap-1 rounded px-1.5 py-0.5 text-xs",
                          hc.status === "passing" && "bg-success-50 text-success-700",
                          hc.status === "failing" && "bg-danger-50 text-danger-700",
                          (hc.status === "pending" || hc.status === "unknown") &&
                            "bg-neutral-100 text-neutral-600"
                        )}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {hc.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {dep.status === "success" && (
                  <Button size="sm" variant="ghost" leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
                    Rollback
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}