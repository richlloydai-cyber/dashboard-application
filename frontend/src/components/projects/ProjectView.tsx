"use client";

// ============================================================
// HERMES DASHBOARD - PROJECT VIEW
// Orchestrates the three-pillar framework for the selected project.
// Pillar model: BUILD & QUALITY (Integrate) | DEPLOY (Deliver) | AGENT (Operate)
// ============================================================

import { GitBranch, GitCommit, Hammer, Rocket, Bot } from "lucide-react";
import { Card, Badge, EmptyState } from "@/components/ui";
import { BuildPipelinePanel } from "./BuildPipelinePanel";
import { QualityGatePanel } from "./QualityGatePanel";
import { DeploymentPanel } from "./DeploymentPanel";
import { AgentTaskPanel } from "./AgentTaskPanel";
import { useSelectedProject, useSelectedPillar } from "@/lib/store";
import { useProjectPillarData } from "@/hooks/useLiveProjects";
import { formatRelativeTime } from "@/lib/utils";
import type { Pillar } from "@/types";

// Section header with the primary #4187ad accent bar
function PillarHeading({ icon: Icon, title, subtitle }: { icon: typeof Hammer; title: string; subtitle: string }) {
  return (
    <div className="mb-4 flex items-center gap-3 border-l-4 border-primary-500 bg-primary-500/5 py-2 pl-3">
      <Icon className="h-5 w-5 text-primary-600" />
      <div>
        <h2 className="font-semibold text-text-primary">{title}</h2>
        <p className="text-xs text-text-tertiary">{subtitle}</p>
      </div>
    </div>
  );
}

export function ProjectView() {
  const project = useSelectedProject();
  const pillar = useSelectedPillar();
  const { data } = useProjectPillarData(project?.id);

  if (!project) {
    return (
      <EmptyState
        icon={<GitBranch className="h-12 w-12" />}
        title="No project selected"
        description="Choose a project from the sidebar to view its pipelines, quality gates, deployments and agent tasks."
      />
    );
  }

  // Live data from the Hermes adapter (mock fallback handled in the hook).
  const pipelines = data?.pipelines ?? [];
  const gates = data?.gates ?? [];
  const environments = data?.environments ?? [];
  const deployments = data?.deployments ?? [];
  const agents = data?.agents ?? [];
  const tasks = data?.tasks ?? [];

  const showPillar = (p: Pillar) => pillar === "overview" || pillar === p;

  return (
    <div className="space-y-6">
      {/* Project header card */}
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-text-primary">{project.displayName}</h1>
              <Badge variant={project.status === "active" ? "success" : "neutral"} dot>
                {project.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-text-secondary">{project.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" /> {project.repository.currentBranch}
              </span>
              <span className="flex items-center gap-1">
                <GitCommit className="h-3 w-3" />
                <code className="rounded bg-neutral-100 px-1">
                  {project.repository.commitSha.slice(0, 7)}
                </code>
                {project.repository.commitMessage}
              </span>
              <span>Updated {formatRelativeTime(project.updatedAt)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.metadata.tags.map((tag) => (
              <Badge key={tag} variant="neutral" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* THREE-PILLAR FRAMEWORK */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Pillar 1: INTEGRATE (Build + Quality) */}
        {(showPillar("build") || showPillar("quality")) && (
          <section className="space-y-4 xl:col-span-1">
            <PillarHeading
              icon={Hammer}
              title="Integrate"
              subtitle="Build pipelines & quality gates"
            />
            {showPillar("build") && <BuildPipelinePanel pipelines={pipelines} />}
            {showPillar("quality") && <QualityGatePanel gates={gates} />}
          </section>
        )}

        {/* Pillar 2: DELIVER (Deploy) */}
        {showPillar("deploy") && (
          <section className="space-y-4 xl:col-span-1">
            <PillarHeading
              icon={Rocket}
              title="Deliver"
              subtitle="Environments & deployment status"
            />
            <DeploymentPanel environments={environments} deployments={deployments} />
          </section>
        )}

        {/* Pillar 3: OPERATE (Agent) */}
        {showPillar("agent") && (
          <section className="space-y-4 xl:col-span-1">
            <PillarHeading
              icon={Bot}
              title="Operate"
              subtitle="Hermes agent tasks & activity"
            />
            <AgentTaskPanel agents={agents} tasks={tasks} />
          </section>
        )}
      </div>
    </div>
  );
}