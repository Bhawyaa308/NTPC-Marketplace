import { type ReactNode, useEffect } from "react";
import {
  X,
  Loader2,
  Inbox,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const rawStatus = (status ?? "").toString().trim();
  const normalized = rawStatus.toUpperCase();
  const labelMap: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    PENDING: "Pending",
    APPROVED: "Approved",
    PAID: "Paid",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",
    EXPIRED: "Expired",
    RESERVED: "Reserved",
    OPEN: "Open",
    "IN REVIEW": "In Review",
    RESOLVED: "Resolved",
    WITHDRAWN: "Withdrawn",
  };
  const label = labelMap[normalized] || rawStatus || "Unknown";
  const map: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PAID: "bg-sky-50 text-sky-700 border-sky-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
    RESERVED: "bg-amber-50 text-amber-700 border-amber-200",
    OPEN: "bg-amber-50 text-amber-700 border-amber-200",
    "IN REVIEW": "bg-sky-50 text-sky-700 border-sky-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    WITHDRAWN: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[normalized] || "bg-slate-100 text-slate-700 border-slate-200"}`}
    >
      {label}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  body?: string;
  icon?: typeof Inbox;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 ntpc-card">
      <div className="rounded-full bg-primary-soft p-3 text-primary mb-4">
        <Icon size={28} />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {body && (
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{body}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
      <Loader2 size={18} className="animate-spin" />{" "}
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="ntpc-card w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted">
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="flex justify-end gap-2 mt-5">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button onClick={onClose} className="ntpc-btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="ntpc-btn-primary"
          >
            Confirm
          </button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </Modal>
  );
}

export function Pagination({
  page = 1,
  total = 5,
  onChange,
}: {
  page?: number;
  total?: number;
  onChange?: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        className="ntpc-btn-secondary !p-2"
        onClick={() => onChange?.(Math.max(1, page - 1))}
      >
        <ChevronLeft size={16} />
      </button>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange?.(i + 1)}
          className={`h-9 w-9 rounded-md text-sm font-medium ${page === i + 1 ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}
        >
          {i + 1}
        </button>
      ))}
      <button
        className="ntpc-btn-secondary !p-2"
        onClick={() => onChange?.(Math.min(total, page + 1))}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export function SearchBar({
  placeholder = "Search products, categories",
  value,
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="relative w-full">
      <SearchIcon
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="ntpc-input pl-9"
      />
    </div>
  );
}
