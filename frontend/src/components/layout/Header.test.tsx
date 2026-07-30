import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/Header";
import { useProjectStore } from "@/lib/store";

describe("<Header />", () => {
  beforeEach(() => useProjectStore.getState().reset());

  it("shows 'Live data' when source=live", () => {
    render(<Header dataSource="live" />);
    expect(screen.getByText("Live data")).toBeInTheDocument();
  });

  it("shows 'No live data' when source=error", () => {
    render(<Header dataSource="error" />);
    expect(screen.getByText("No live data")).toBeInTheDocument();
  });

  it("shows ellipsis while loading", () => {
    render(<Header dataSource="loading" />);
    expect(screen.getByText("…")).toBeInTheDocument();
  });

  it("renders the title bar + time range selector", () => {
    render(<Header dataSource="live" />);
    expect(screen.getByText("Hermes Project Control")).toBeInTheDocument();
    // Time range select has the 24h option.
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows the selected project name when set", () => {
    useProjectStore.getState().setSelectedProject({ displayName: "My Board" } as any);
    render(<Header dataSource="live" />);
    expect(screen.getByText("My Board")).toBeInTheDocument();
  });

  it("has a link to the login page", () => {
    render(<Header dataSource="live" />);
    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});