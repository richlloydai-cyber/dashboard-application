"use client";

// ============================================================
// HERMES DASHBOARD - BUILD PIPELINE PANEL
// Pillar 1a: active build pipelines + stage progress
// ============================================================

import { Hammer, Play, GitCommit, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, Badge, Button, StatusIndicator } from "@/components/ui";
import { cn, formatDuration, formatRelativeTime } from "@/lib/utils";
import type { BuildPipeline, BuildStatus } from "@/types";

const TREND_ICON = { improving: TrendingUp, degrading: TrendingDown, stable: Minus };
const TREND_COLOR = {
  improving: "text-success-600",
  degrading: "text-danger-600",
  stable: "text-text-tertiary",
};

function StageBar({ stages }: { stages: { stageId: string; name: string; status: BuildStatus }[] }) {
  return (
    <div className="flex items-center gap-1">
      {stages.map((s) => (
        <div key={s.stageId} className="group relative flex-1" title={`${s.name}: ${s.status}`}>
          <div
            className={cn(
              "h-1.5 rounded-full transition-colors",
              s.status === "success" && "bg-success-500",
              s.status === "running" && "bg-primary-500 animate-pulse",
              s.status === "failed" && "bg-danger-500",
              (s.status === "queued" || s.status === "idle") && "bg-neutral-200"
            )}
          />
        </div>
      ))}
    </div>
  );
}

export function BuildPipelinePanel({ pipelines }: { pipelines: BuildPipeline[] }) {
  if (pipelines.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-2 text-text-tertiary">
          <Hammer className="h-5 w-5" />
          <span className="text-sm">No pipelines configured for this project.</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pipelines.map((pipeline) => {
        const TrendIcon = TREND_ICON[pipeline.metrics.trend];
        const run = pipeline.currentRun;
        return (
          <Card key={pipeline.id} className="overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Hammer className="h-4 w-4 text-blue-600" />
                  <h3 className="truncate font-semibold text-text-primary">{pipeline.name}</h3>
                  <Badge
                    variant={
                      pipeline.status === "success"
                        ? "success"
                        : pipeline.status === "running"
                          ? "info"
                          : pipeline.status === "failed"
                            ? "danger"
                            : "neutral"
                    }
                    dot
                  >
                    {pipeline.status}
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="outline" leftIcon={<Play className="h-3.5 w-3.5" />}>
                Trigger
              </Button>
            </div>

            {/* Current run */}
            {run && (
              <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-text-primary">
                    #{run.number}
                    <StatusIndicator status={run.status} label={run.status} size="sm" />
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-tertiary">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(run.startedAt)}
                  </span>
                </div>
                <StageBar stages={run.stages} />
                <div className="mt-2 flex items-center justify-between">
                  <span className="flex min-w-0 items-center gap-1.5 text-xs text-text-secondary">
                    <GitCommit className="h-3 w-3 flex-shrink-0" />
                    <code className="rounded bg-neutral-200 px-1">{run.commit.shortSha}</code>
                    <span className="truncate">{run.commit.message}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Metrics */}
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-4 text-center">
              <div>
                <p className="text-lg font-semibold text-text-primary">
                  {(pipeline.metrics.successRate * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-text-tertiary">Success rate</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary">
                  {formatDuration(pipeline.metrics.averageDuration)}
                </p>
                <p className="text-xs text-text-tertiary">Avg duration</p>
              </div>
              <div>
                <p
                  className={cn(
                    "flex items-center justify-center gap-1 text-lg font-semibold",
                    TREND_COLOR[pipeline.metrics.trend]
                  )}
                >
                  <TrendIcon className="h-4 w-4" />
                  {pipeline.metrics.trend}
                </p>
                <p className="text-xs text-text-tertiary">{pipeline.metrics.totalRuns} runs</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}