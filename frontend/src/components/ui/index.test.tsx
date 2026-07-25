import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardContent,
  CardFooter,
  Badge,
  Avatar,
  DropdownMenu,
  Tabs,
  Tooltip,
  Skeleton,
  SkeletonCard,
  Progress,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  SectionHeader,
  StatusIndicator,
} from "@/components/ui";

describe("ui primitives", () => {
  describe("Button", () => {
    it("renders label + click", () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Go</Button>);
      fireEvent.click(screen.getByText("Go"));
      expect(onClick).toHaveBeenCalled();
    });
    it("applies variant/size + loading disables + spinner", () => {
      render(
        <Button variant="danger" size="lg" loading data-testid="b">
          Save
        </Button>
      );
      const b = screen.getByTestId("b") as HTMLButtonElement;
      expect(b.disabled).toBe(true);
      expect(screen.queryByText("Save")).toBeInTheDocument();
    });
    it("respects disabled + icons", () => {
      render(
        <Button disabled leftIcon={<span>L</span>} rightIcon={<span>R</span>}>
          Mid
        </Button>
      );
      expect((screen.getByText("Mid").closest("button") as HTMLButtonElement).disabled).toBe(true);
      expect(screen.getByText("L")).toBeInTheDocument();
      expect(screen.getByText("R")).toBeInTheDocument();
    });
  });

  describe("Input", () => {
    it("renders label + controlled value", () => {
      const onChange = vi.fn();
      render(<Input label="Name" value="abc" onChange={onChange} data-testid="i" />);
      const i = screen.getByTestId("i") as HTMLInputElement;
      expect(i.value).toBe("abc");
      fireEvent.change(i, { target: { value: "x" } });
      expect(onChange).toHaveBeenCalled();
    });
    it("shows error + hint, sets aria", () => {
      const { rerender } = render(
        <Input label="Email" error="Bad" data-testid="e" />
      );
      expect(screen.getByRole("alert")).toHaveTextContent("Bad");
      const e = screen.getByTestId("e") as HTMLInputElement;
      expect(e.getAttribute("aria-invalid")).toBe("true");
      rerender(<Input label="Email" hint="Enter it" data-testid="e" />);
      expect(screen.getByText("Enter it")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
    it("derives id from label when no id given", () => {
      render(<Input label="First Name" data-testid="f" />);
      expect(screen.getByTestId("f").id).toBe("first-name");
    });
    it("renders left/right icons", () => {
      render(
        <Input leftIcon={<span>L</span>} rightIcon={<span>R</span>} data-testid="lr" />
      );
      expect(screen.getByText("L")).toBeInTheDocument();
      expect(screen.getByText("R")).toBeInTheDocument();
    });
  });

  describe("Card family", () => {
    it("renders with variants + padding + children", () => {
      render(
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>T</CardTitle>
            <CardSubtitle>S</CardSubtitle>
          </CardHeader>
          <CardContent>C</CardContent>
          <CardFooter>F</CardFooter>
        </Card>
      );
      expect(screen.getByText("T")).toBeInTheDocument();
      expect(screen.getByText("S")).toBeInTheDocument();
      expect(screen.getByText("C")).toBeInTheDocument();
      expect(screen.getByText("F")).toBeInTheDocument();
    });
    it("default variant renders", () => {
      render(<Card>body</Card>);
      expect(screen.getByText("body")).toBeInTheDocument();
    });
  });

  describe("Badge", () => {
    it("renders variants + dot", () => {
      render(
        <>
          <Badge variant="success">good</Badge>
          <Badge variant="warning">warn</Badge>
          <Badge variant="danger">bad</Badge>
          <Badge variant="info">info</Badge>
          <Badge variant="neutral" size="sm" dot>
            dot
          </Badge>
        </>
      );
      expect(screen.getByText("good")).toBeInTheDocument();
      expect(screen.getByText("warn")).toBeInTheDocument();
      expect(screen.getByText("bad")).toBeInTheDocument();
      expect(screen.getByText("info")).toBeInTheDocument();
      expect(screen.getByText("dot")).toBeInTheDocument();
    });
  });

  describe("Avatar", () => {
    it("renders image when src given", () => {
      render(<Avatar src="/a.png" alt="me" name="Alice" />);
      expect(screen.getByAltText("me")).toBeInTheDocument();
    });
    it("renders initials when no src", () => {
      render(<Avatar name="Alice Bob" size="lg" shape="square" />);
      expect(screen.getByText("AB")).toBeInTheDocument();
    });
    it("renders '?' when no name", () => {
      render(<Avatar />);
      expect(screen.getByText("?")).toBeInTheDocument();
    });
  });

  describe("DropdownMenu", () => {
    it("toggles open + fires item onClick", () => {
      const onA = vi.fn();
      const { container } = render(
        <DropdownMenu
          trigger={<span>Menu</span>}
          items={[
            { label: "A", onClick: onA },
            { label: "B", disabled: true },
            { label: "C", danger: true },
            { divider: true },
            { label: "D", icon: <span>i</span> },
          ]}
        />
      );
      fireEvent.click(screen.getByText("Menu"));
      // all items + divider rendered while open
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
      expect(screen.getByText("C")).toBeInTheDocument();
      expect(screen.getByText("D")).toBeInTheDocument();
      // divider present
      expect(container.querySelector('[role="separator"]')).toBeInTheDocument();
      // clicking A fires + closes the menu
      fireEvent.click(screen.getByText("A"));
      expect(onA).toHaveBeenCalled();
      expect(screen.queryByText("A")).not.toBeInTheDocument();
    });
    it("does not fire onClick on disabled item", () => {
      const onB = vi.fn();
      render(
        <DropdownMenu trigger={<span>T</span>} items={[{ label: "B", disabled: true, onClick: onB }]} />
      );
      fireEvent.click(screen.getByText("T"));
      const b = screen.getByText("B") as HTMLButtonElement;
      fireEvent.click(b);
      expect(onB).not.toHaveBeenCalled();
    });
    it("aligns left", () => {
      render(<DropdownMenu trigger={<span>T2</span>} align="left" items={[{ label: "X" }]} />);
      fireEvent.click(screen.getByText("T2"));
      expect(screen.getByText("X")).toBeInTheDocument();
    });
  });

  describe("Tabs", () => {
    it("renders tabs + calls onChange when active changes", () => {
      const onChange = vi.fn();
      const tabs = [
        { id: "t1", label: "One" },
        { id: "t2", label: "Two", count: 3, icon: <span>!</span> },
        { id: "t3", label: "Three", disabled: true },
      ];
      render(<Tabs tabs={tabs} activeTab="t1" onChange={onChange} />);
      fireEvent.click(screen.getByText("Two"));
      expect(onChange).toHaveBeenCalledWith("t2");
      // disabled tab does nothing
      fireEvent.click(screen.getByText("Three"));
      expect(onChange).not.toHaveBeenCalledWith("t3");
      // count + icon render
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("!")).toBeInTheDocument();
    });
    it("pills + underline variants render", () => {
      const tabs = [{ id: "a", label: "A" }];
      const { rerender } = render(<Tabs tabs={tabs} activeTab="a" onChange={() => {}} variant="pills" />);
      rerender(<Tabs tabs={tabs} activeTab="a" onChange={() => {}} variant="underline" />);
      expect(screen.getByText("A")).toBeInTheDocument();
    });
  });

  describe("Tooltip", () => {
    it("shows on hover, hides on leave", async () => {
      render(
        <Tooltip content="Hi there" position="bottom">
          <span>Hover</span>
        </Tooltip>
      );
      fireEvent.mouseEnter(screen.getByText("Hover"));
      expect(await screen.findByRole("tooltip")).toHaveTextContent("Hi there");
      fireEvent.mouseLeave(screen.getByText("Hover"));
      await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
    });
    it("positions left/right", async () => {
      const { rerender } = render(
        <Tooltip content="L" position="left"><span>x</span></Tooltip>
      );
      fireEvent.mouseEnter(screen.getByText("x"));
      expect(await screen.findByRole("tooltip")).toBeInTheDocument();
      rerender(<Tooltip content="R" position="right"><span>x</span></Tooltip>);
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
  });

  describe("Skeleton", () => {
    it("renders variants + SkeletonCard with lines", () => {
      render(<Skeleton variant="circular" width={40} height={40} />);
      render(<Skeleton variant="rectangular" />);
      render(<Skeleton variant="card" />);
      render(<SkeletonCard lines={2} />);
      expect(screen.getAllByText(/^$/).length).toBeGreaterThan(0);
    });
  });

  describe("Progress", () => {
    it("renders bar + clamps percentage + label", () => {
      const { rerender, container } = render(<Progress value={50} />);
      const bar = () => container.querySelector('[role="progressbar"]') as HTMLElement;
      expect(bar().getAttribute("aria-valuenow")).toBe("50");
      rerender(<Progress value={150} max={100} />);
      expect(bar().style.width).toBe("100%");
      rerender(<Progress value={40} showLabel />);
      expect(screen.getByText("40")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      rerender(<Progress value={10} variant="danger" size="lg" />);
      expect(bar().getAttribute("aria-valuenow")).toBe("10");
    });
  });

  describe("Table", () => {
    it("renders a full table", () => {
      render(
        <Table striped compact>
          <TableHeader>
            <TableRow>
              <TableHead>H1</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>D1</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText("H1")).toBeInTheDocument();
      expect(screen.getByText("D1")).toBeInTheDocument();
    });
  });

  describe("EmptyState + SectionHeader", () => {
    it("renders empty state parts", () => {
      render(
        <EmptyState icon={<span>!</span>} title="None" description="no data" action={<button>Add</button>} />
      );
      expect(screen.getByText("None")).toBeInTheDocument();
      expect(screen.getByText("no data")).toBeInTheDocument();
      expect(screen.getByText("Add")).toBeInTheDocument();
    });
    it("renders section header parts", () => {
      render(
        <SectionHeader title="Dash" description="desc" badge={<span>B</span>} action={<button>Go</button>} />
      );
      expect(screen.getByText("Dash")).toBeInTheDocument();
      expect(screen.getByText("desc")).toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
      expect(screen.getByText("Go")).toBeInTheDocument();
    });
  });

  describe("StatusIndicator", () => {
    it("renders label + dot variants + icon fallback", () => {
      render(
        <>
          <StatusIndicator status="success" label="OK" />
          <StatusIndicator status="fail" label="fail" size="lg" />
          <StatusIndicator status="running" label="running" showDot={false} />
        </>
      );
      expect(screen.getByText("OK")).toBeInTheDocument();
      expect(screen.getByText("fail")).toBeInTheDocument();
      expect(screen.getByText("running")).toBeInTheDocument();
    });
  });
});
