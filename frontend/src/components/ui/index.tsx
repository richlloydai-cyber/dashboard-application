// ============================================================
// HERMES DASHBOARD - UI COMPONENTS
// Reusable UI components with Tailwind CSS
// ============================================================

"use client";

import React, {
  forwardRef,
  useState,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from "react";
import { cn, getStatusColor, getStatusIcon } from "@/lib/utils";

// ============================================================
// BUTTON
// ============================================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary: "bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 active:bg-primary-700",
      secondary: "bg-neutral-100 text-text-primary hover:bg-neutral-200 focus-visible:ring-neutral-500 active:bg-neutral-300",
      ghost: "bg-transparent text-text-secondary hover:bg-neutral-100 hover:text-text-primary focus-visible:ring-neutral-500 active:bg-neutral-200",
      danger: "bg-danger-500 text-white hover:bg-danger-600 focus-visible:ring-danger-500 active:bg-danger-700",
      outline: "border border-neutral-300 bg-white text-text-primary hover:bg-neutral-50 focus-visible:ring-primary-500 active:bg-neutral-100",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2.5 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2",
      icon: "p-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

// ============================================================
// INPUT
// ============================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "input",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "input-error",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger-600" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-text-tertiary">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ============================================================
// CARD
// ============================================================

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    const variants = {
      default: "bg-white rounded-xl border border-neutral-200 shadow-sm",
      elevated: "bg-white rounded-xl shadow-md",
      outlined: "bg-white rounded-xl border-2 border-neutral-200",
    };

    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold text-text-primary", className)} {...props}>
      {children}
    </h3>
  )
);

CardTitle.displayName = "CardTitle";

export const CardSubtitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-text-secondary mt-0.5", className)} {...props}>
      {children}
    </p>
  )
);

CardSubtitle.displayName = "CardSubtitle";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-4 pt-4 border-t border-neutral-200 flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = "CardFooter";

// ============================================================
// BADGE
// ============================================================

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", size = "md", dot = false, children, ...props }, ref) => {
    const variants = {
      success: "bg-success-100 text-success-800",
      warning: "bg-warning-100 text-warning-800",
      danger: "bg-danger-100 text-danger-800",
      info: "bg-primary-100 text-primary-800",
      neutral: "bg-neutral-100 text-neutral-800",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-0.5 text-xs",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-medium",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              variant === "success" && "bg-success-500",
              variant === "warning" && "bg-warning-500",
              variant === "danger" && "bg-danger-500",
              variant === "info" && "bg-primary-500",
              variant === "neutral" && "bg-neutral-500"
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// ============================================================
// AVATAR
// ============================================================

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = "md", shape = "circle", ...props }, ref) => {
    const sizes = {
      xs: "w-6 h-6 text-xs",
      sm: "w-8 h-8 text-sm",
      md: "w-10 h-10 text-base",
      lg: "w-12 h-12 text-lg",
      xl: "w-16 h-16 text-xl",
    };

    const shapes = {
      circle: "rounded-full",
      square: "rounded-lg",
    };

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const bgColors = [
      "bg-primary-100 text-primary-700",
      "bg-green-100 text-green-700",
      "bg-purple-100 text-purple-700",
      "bg-orange-100 text-orange-700",
      "bg-pink-100 text-pink-700",
      "bg-blue-100 text-blue-700",
      "bg-indigo-100 text-indigo-700",
      "bg-teal-100 text-teal-700",
    ];

    const colorIndex = name
      ? name.charCodeAt(0) % bgColors.length
      : 0;

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium overflow-hidden",
          sizes[size],
          shapes[shape],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={bgColors[colorIndex]}>{name ? getInitials(name) : "?"}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

// ============================================================
// DROPDOWN MENU
// ============================================================

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

interface DropdownItem {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  subItems?: DropdownItem[];
}

export function DropdownMenu({ trigger, items, align = "right" }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="btn-ghost"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </button>

      {open && (
        <div
          ref={menuRef}
          className={cn(
            "select-content absolute z-50 mt-1.5 min-w-[160px]",
            align === "right" ? "right-0" : "left-0"
          )}
          role="menu"
        >
          {items.map((item, index) => (
            item.divider ? (
              <hr key={index} className="my-1 border-neutral-200" role="separator" />
            ) : (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                disabled={item.disabled}
                className={cn(
                  "select-item w-full",
                  item.danger && "text-danger-600 focus:bg-danger-50 focus:text-danger-600"
                )}
                role="menuitem"
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TABS
// ============================================================

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tab: string) => void;
  variant?: "default" | "pills" | "underline";
  className?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export function Tabs({ tabs, activeTab, onChange, variant = "default", className }: TabsProps) {
  const variants = {
    default: "inline-flex h-10 items-center justify-center rounded-lg bg-neutral-100 p-1",
    pills: "inline-flex gap-1",
    underline: "flex border-b border-neutral-200",
  };

  const tabVariants = {
    default: "tabs-trigger",
    pills: "rounded-lg px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-text-primary data-[state=active]:shadow-sm",
    underline: "h-10 px-4 border-b-2 -mb-px text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary-600 data-[state=active]:border-primary-600",
  };

  return (
    <div className={cn(variants[variant], className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          className={cn(
            tabVariants[variant],
            activeTab === tab.id && "data-[state=active]",
            tab.disabled && "opacity-50 pointer-events-none"
          )}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn("ml-1.5 px-1.5 py-0.5 text-xs rounded-full", activeTab === tab.id ? "bg-primary-100 text-primary-700" : "bg-neutral-200 text-neutral-600")}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// TOOLTIP
// ============================================================

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export function Tooltip({ content, children, position = "top", delay = 200 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const childRef = useRef<HTMLDivElement>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrows = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-neutral-900",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-neutral-900",
    left: "left-full top-1/2 -translate-y-1/2 border-l-neutral-900",
    right: "right-full top-1/2 -translate-y-1/2 border-r-neutral-900",
  };

  return (
    <div
      ref={childRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className="inline-block"
    >
      {children}
      {visible && (
        <div
          className={cn(
            "tooltip z-50 whitespace-nowrap animate-fade-in",
            positions[position]
          )}
          role="tooltip"
        >
          {content}
          <div
            className={cn(
              "absolute w-0 h-0 border-4 border-transparent",
              arrows[position]
            )}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================
// SKELETON LOADERS
// ============================================================

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = "text", width, height, ...props }: SkeletonProps) {
  const variants = {
    text: "h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-xl",
  };

  return (
    <div
      className={cn(
        "skeleton animate-pulse bg-neutral-200",
        variants[variant],
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}

export function SkeletonCard({ className, lines = 3, ...props }: HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("card p-6 space-y-4", className)} {...props}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} variant="text" width={i === lines - 1 ? "60%" : "100%"} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PROGRESS BAR
// ============================================================

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
}

export function Progress({ className, value, max = 100, size = "md", showLabel = false, variant = "default", ...props }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const variants = {
    default: "bg-primary-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className={cn("relative overflow-hidden rounded-full bg-neutral-200", sizes[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-xs text-text-secondary">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TABLE
// ============================================================

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, striped = false, hoverable = true, compact = false, children, ...props }, ref) => (
    <div className="table-container overflow-x-auto">
      <table
        ref={ref}
        className={cn(
          "table w-full",
          striped && "even:bg-neutral-50",
          hoverable && "table-row",
          compact && "text-xs",
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);

Table.displayName = "Table";

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <thead ref={ref} className={cn("table-header", className)} {...props}>
      {children}
    </thead>
  )
);

TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <tbody ref={ref} className={cn("divide-y divide-neutral-100", className)} {...props}>
      {children}
    </tbody>
  )
);

TableBody.displayName = "TableBody";

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, children, ...props }, ref) => (
    <tr ref={ref} className={cn("table-row", className)} {...props}>
      {children}
    </tr>
  )
);

TableRow.displayName = "TableRow";

export const TableHead = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className, children, ...props }, ref) => (
    <th ref={ref} className={cn("table-head", className)} {...props}>
      {children}
    </th>
  )
);

TableHead.displayName = "TableHead";

export const TableCell = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className, children, ...props }, ref) => (
    <td ref={ref} className={cn("table-cell", className)} {...props}>
      {children}
    </td>
  )
);

TableCell.displayName = "TableCell";

// ============================================================
// EMPTY STATE
// ============================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {icon && <div className="mb-4 text-neutral-300">{icon}</div>}
      <h3 className="text-lg font-medium text-text-primary">{title}</h3>
      {description && (
        <p className="mt-1 text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, action, badge, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6", className)}>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-text-primary">{title}</h2>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-text-secondary">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ============================================================
// STATUS INDICATOR
// ============================================================

interface StatusIndicatorProps {
  status: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  className?: string;
}

export function StatusIndicator({ status, label, size = "md", showDot = true, className }: StatusIndicatorProps) {
  const sizes = {
    sm: "text-xs gap-1",
    md: "text-sm gap-1.5",
    lg: "text-base gap-2",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <span className={cn("inline-flex items-center", sizes[size], className)}>
      {showDot && (
        <span
          className={cn(
            "rounded-full flex-shrink-0",
            dotSizes[size],
            getStatusColor(status).replace("text-", "bg-").replace("bg-", "bg-")
          )}
        />
      )}
      {label && <span className={cn("font-medium", getStatusColor(status))}>{label}</span>}
      {!label && <span className={cn("font-medium", getStatusColor(status))}>{getStatusIcon(status)}</span>}
    </span>
  );
}