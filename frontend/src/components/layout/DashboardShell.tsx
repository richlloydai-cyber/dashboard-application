"use client";

// ============================================================
// HERMES DASHBOARD - SHELL
// Wires Header + Sidebar + main content, seeds store, opens WS
// ============================================================

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useProjectStore } from "@/lib/store";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useLiveProjects } from "@/hooks/useLiveProjects";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const selectedProject = useProjectStore((s) => s.selectedProject);

  // Load projects from the live Hermes adapter (falls back to mock data).
  const { source } = useLiveProjects();

  // Open the live WS connection (auto-reconnects). Harmless if backend absent.
  useWebSocket({ projectId: selectedProject?.id, autoConnect: true });

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <Header dataSource={source} />
      <main className="pt-16 lg:pl-72">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}