"use client";

// ============================================================
// HERMES DASHBOARD - QUALITY GATE PANEL
// Pillar 1b: code quality gates, rules, coverage
// ============================================================

import { ShieldCheck, ShieldAlert, ShieldX, Play, FileBarChart } from "lucide-react";
import { Card, Badge, Button, Progress } from "@/components/ui";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { QualityGate, QualityGateStatus } from "@/types";

const GATE_ICON: Record<QualityGateStatus, typeof ShieldCheck> = {
  passed: ShieldCheck,
  failed: ShieldX,
  warning: ShieldAlert,
  pending: ShieldAlert,
  skipped: ShieldAlert,
};

const GATE_STYLE: Record<QualityGateStatus, { badge: "success" | "danger" | "warning" | "neutral"; icon: string }> = {
  passed: { badge: "success", icon: "text-success-600" },
  failed: { badge: "danger", icon: "text-danger-600" },
  warning: { badge: "warning", icon: "text-warning-600" },
  pending: { badge: "neutral", icon: "text-neutral-500" },
  skipped: { badge: "neutral", icon: "text-neutral-400" },
};

export function QualityGatePanel({ gates }: { gates: QualityGate[] }) {
  if (gates.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-2 text-text-tertiary">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm">No quality gates configured.</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {gates.map((gate) => {
        const Icon = GATE_ICON[gate.status];
        const style = GATE_STYLE[gate.status];
        const run = gate.lastRun;
        const scoreVariant =
          run.summary.overallScore >= 90
            ? "success"
            : run.summary.overallScore >= 70
              ? "warning"
              : "danger";

        return (
          <Card key={gate.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Icon className={cn("h-6 w-6", style.icon)} />
                <div>
                  <h3 className="font-semibold text-text-primary">{gate.name}</h3>
                  <p className="text-xs text-text-tertiary">
                    Last scan {formatRelativeTime(run.finishedAt)}
                  </p>
                </div>
              </div>
              <Badge variant={style.badge} dot>
                {gate.status}
              </Badge>
            </div>

            {/* Overall score */}
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-text-secondary">Overall score</span>
                <span className="font-semibold text-text-primary">
                  {run.summary.overallScore}/100
                </span>
              </div>
              <Progress value={run.summary.overallScore} variant={scoreVariant} />
            </div>

            {/* Rule summary */}
            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg bg-success-50 py-2">
                <p className="text-base font-semibold text-success-700">{run.summary.passed}</p>
                <p className="text-success-600">Passed</p>
              </div>
              <div className="rounded-lg bg-danger-50 py-2">
                <p className="text-base font-semibold text-danger-700">{run.summary.failed}</p>
                <p className="text-danger-600">Failed</p>
              </div>
              <div className="rounded-lg bg-warning-50 py-2">
                <p className="text-base font-semibold text-warning-700">{run.summary.warnings}</p>
                <p className="text-warning-600">Warnings</p>
              </div>
              <div className="rounded-lg bg-neutral-100 py-2">
                <p className="text-base font-semibold text-neutral-700">{run.summary.skipped}</p>
                <p className="text-neutral-500">Skipped</p>
              </div>
            </div>

            {/* Rule detail rows */}
            <ul className="mt-4 divide-y divide-neutral-100 border-t border-neutral-100">
              {run.results.map((r) => (
                <li key={r.ruleId} className="flex items-center justify-between py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        r.passed ? "bg-success-500" : "bg-danger-500"
                      )}
                    />
                    <span className="text-text-secondary">{r.ruleName}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <code
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs font-medium",
                        r.passed ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"
                      )}
                    >
                      {r.value}
                    </code>
                    <span className="text-xs text-text-tertiary">
                      {r.operator === "gte" ? "≥" : r.operator === "lte" ? "≤" : r.operator} {r.threshold}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-4">
              <Button size="sm" variant="outline" leftIcon={<Play className="h-3.5 w-3.5" />}>
                Re-scan
              </Button>
              {run.reportUrl && (
                <Button size="sm" variant="ghost" leftIcon={<FileBarChart className="h-3.5 w-3.5" />}>
                  View report
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}