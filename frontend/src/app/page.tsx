import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProjectView } from "@/components/projects/ProjectView";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <ProjectView />
    </DashboardShell>
  );
}