import { cn } from "@/lib/utils";

type Status = "ready" | "pass" | "warn" | "fail";

const statusConfig: Record<Status, { label: string; dot: string; text: string }> = {
  ready: { label: "READY", dot: "bg-cyan", text: "text-cyan" },
  pass: { label: "PASS", dot: "bg-signal", text: "text-signal" },
  warn: { label: "WARN", dot: "bg-amber", text: "text-amber" },
  fail: { label: "FAIL", dot: "bg-fault", text: "text-fault" },
};

type StatusBadgeProps = React.ComponentProps<"span"> & {
  status: Status;
  /** Override the default label text (defaults to the status name). */
  label?: string;
};

/**
 * A pass/fail/warn/ready readout, modeled on test-equipment status LEDs.
 * Red (`fail`) is reserved for actual fault/error states — never used
 * decoratively.
 */
export function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-label uppercase tracking-label",
        config.text,
        className,
      )}
      {...props}
    >
      <span className={cn("size-1.5 rounded-full", config.dot)} aria-hidden="true" />
      {label ?? config.label}
    </span>
  );
}
