"use client";

// ============================================================
// HERMES DASHBOARD - SIDEBAR
// Project list + three-pillar navigation
// ============================================================

import {
  LayoutDashboard,
  Hammer,
  ShieldCheck,
  Rocket,
  Bot,
  FolderGit2,
  ChevronRight,
  Circle,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  useProjectStore,
  useProjects,
  useSelectedProject,
  useSelectedPillar,
} from "@/lib/store";
import type { Pillar, Project } from "@/types";

const PILLARS: { id: Pillar | "overview"; label: string; icon: typeof Hammer }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "build", label: "Build Pipelines", icon: Hammer },
  { id: "quality", label: "Quality Gates", icon: ShieldCheck },
  { id: "deploy", label: "Deployments", icon: Rocket },
  { id: "agent", label: "Agent Tasks", icon: Bot },
];

const STATUS_DOT: Record<Project["status"], string> = {
  active: "text-success-500",
  inactive: "text-neutral-400",
  archived: "text-neutral-300",
  maintenance: "text-warning-500",
  error: "text-danger-500",
};

export function Sidebar() {
  const projects = useProjects();
  const selectedProject = useSelectedProject();
  const selectedPillar = useSelectedPillar();
  const setSelectedProject = useProjectStore((s) => s.setSelectedProject);
  const setSelectedPillar = useProjectStore((s) => s.setSelectedPillar);
  const sidebarOpen = useProjectStore((s) => s.ui.sidebarOpen);

  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => useProjectStore.getState().setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 lg:z-30 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b border-neutral-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 font-bold text-white">
            H
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-text-primary">Hermes</p>
            <p className="text-xs text-text-tertiary">Project Dashboard</p>
          </div>
        </div>

        {/* Pillar navigation */}
        <nav className="border-b border-neutral-200 p-3">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Pillars
          </p>
          <ul className="space-y-0.5">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              const active = selectedPillar === pillar.id;
              return (
                <li key={pillar.id}>
                  <button
                    onClick={() => setSelectedPillar(pillar.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary-50 text-primary-700"
                        : "text-text-secondary hover:bg-neutral-100 hover:text-text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {pillar.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Project list */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Projects ({projects.length})
          </p>
          <ul className="space-y-1">
            {projects.map((project) => {
              const active = selectedProject?.id === project.id;
              return (
                <li key={project.id}>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className={cn(
                      "group flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                      active ? "bg-primary-50" : "hover:bg-neutral-100"
                    )}
                  >
                    <FolderGit2
                      className={cn(
                        "mt-0.5 h-4 w-4 flex-shrink-0",
                        active ? "text-primary-600" : "text-text-tertiary"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Circle
                          className={cn(
                            "h-2 w-2 flex-shrink-0 fill-current",
                            STATUS_DOT[project.status]
                          )}
                        />
                        <span
                          className={cn(
                            "truncate text-sm font-medium",
                            active ? "text-primary-700" : "text-text-primary"
                          )}
                        >
                          {project.displayName}
                        </span>
                      </div>
                      <p className="truncate text-xs text-text-tertiary">
                        {project.metadata.framework} · {formatRelativeTime(project.lastActivity)}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        "mt-0.5 h-4 w-4 flex-shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100",
                        active && "opacity-100 text-primary-600"
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-4">
          <p className="text-xs text-text-tertiary">
            Hermes Dashboard v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}