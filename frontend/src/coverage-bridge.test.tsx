import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Header } from "@/components/layout/Header";
import { DropdownMenu, StatusIndicator, Progress } from "@/components/ui";
import { useProjectStore } from "@/lib/store";
import {
  useSelectedProjectId,
  useSidebarOpen,
  useTheme,
  useLoading,
  useError,
} from "@/lib/store";

// Render a hook-based selector to confirm it wires to the store.
function renderSelector<T>(selector: () => T): T {
  let value: T = undefined as unknown as T;
  function Probe() {
    value = selector();
    return null;
  }
  render(<Probe />);
  return value;
}

describe("store selectors (coverage)", () => {
  beforeEach(() => {
    try {
      (globalThis as any).localStorage?.clear();
    } catch {
      /* noop */
    }
    useProjectStore.setState({
      projects: [],
      selectedProject: null,
      ui: { selectedProjectId: "x", selectedPillar: "overview", timeRange: "24h", refreshInterval: 30000, sidebarOpen: true, theme: "system" },
      pillarCache: new Map(),
      pipelines: new Map(),
      buildRuns: new Map(),
      qualityGates: new Map(),
      qualityRuns: new Map(),
      environments: new Map(),
      deployments: new Map(),
      agentTasks: new Map(),
      agentStatuses: new Map(),
      wsConnected: false,
      loading: { foo: true },
      errors: { bar: "boom" },
    });
  });

  it("useSelectedProjectId / useSidebarOpen / useTheme read ui", () => {
    expect(renderSelector(useSelectedProjectId)).toBe("x");
    expect(renderSelector(useSidebarOpen)).toBe(true);
    expect(renderSelector(useTheme)).toBe("system");
  });

  it("useLoading / useError read maps", () => {
    expect(renderSelector(useLoading)("foo")).toBe(true);
    expect(renderSelector(useError)("bar")).toBe("boom");
  });
});

describe("Header interactions (coverage)", () => {
  beforeEach(() => useProjectStore.getState().reset());

  it("toggles sidebar on menu click", () => {
    const { container } = render(<Header dataSource="live" />);
    const toggle = screen.getByLabelText("Toggle sidebar");
    expect(useProjectStore.getState().ui.sidebarOpen).toBe(true);
    fireEvent.click(toggle);
    expect(useProjectStore.getState().ui.sidebarOpen).toBe(false);
  });

  it("changes time range via select", () => {
    render(<Header dataSource="live" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "7d" } });
    expect(useProjectStore.getState().ui.timeRange).toBe("7d");
  });
});

describe("DropdownMenu outside-click (coverage)", () => {
  beforeEach(() => useProjectStore.getState().reset());

  it("closes when clicking outside the menu", () => {
    const onA = vi.fn();
    const { getByText } = render(
      <DropdownMenu
        trigger={<span>Menu</span>}
        items={[{ label: "A", onClick: onA }]}
      />
    );
    // Open the menu.
    fireEvent.click(getByText("Menu"));
    expect(getByText("A")).toBeInTheDocument();
    // Click outside (on the document body) -> closes.
    act(() => {
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    expect(screen.queryByText("A")).toBeNull();
  });
});

describe("UI misc (coverage)", () => {
  it("StatusIndicator + Progress render variants", () => {
    const { rerender } = render(<StatusIndicator status="success" label="OK" />);
    rerender(<StatusIndicator status="running" label="run" size="lg" />);
    rerender(<Progress value={40} showLabel />);
    expect(screen.getByText("40")).toBeInTheDocument();
  });
});
