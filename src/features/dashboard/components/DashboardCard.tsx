"use client";

import { useState, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";

type DashboardCardProps = {
  title: string;
  icon: ReactNode;
  isLoading?: boolean;
  onRefresh?: () => void;
  lastUpdated?: number;
  children: ReactNode;
};

export function DashboardCard({
  title,
  icon,
  isLoading,
  onRefresh,
  lastUpdated,
  children,
}: DashboardCardProps) {
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || spinning) return;
    setSpinning(true);
    onRefresh();
    window.setTimeout(() => setSpinning(false), 800);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
        <span className="text-indigo-500">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        <div className="ml-auto flex items-center gap-2">
          {lastUpdated && lastUpdated > 0 && (
            <span className="text-xs text-slate-400">
              {format(new Date(lastUpdated), "HH:mm:ss")}
            </span>
          )}
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading || spinning}
              className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
              title="새로고침"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isLoading || spinning ? "animate-spin" : ""}`}
              />
            </button>
          )}
          {!onRefresh && (isLoading || spinning) && (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
          )}
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

type InfoRowProps = {
  label: string;
  value: ReactNode;
  mono?: boolean;
};

export function InfoRow({ label, value, mono }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm border-b border-slate-50 last:border-0">
      <span className="text-slate-500 shrink-0 pr-4">{label}</span>
      <span
        className={`text-slate-800 text-right truncate max-w-xs ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

type StatusBadgeProps = {
  status: "online" | "offline" | "warning" | "unknown";
  label: string;
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = {
    online: "bg-emerald-50 text-emerald-700 border-emerald-200",
    offline: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    unknown: "bg-slate-50 text-slate-600 border-slate-200",
  } as const;

  const dots = {
    online: "bg-emerald-500",
    offline: "bg-red-500",
    warning: "bg-amber-500",
    unknown: "bg-slate-400",
  } as const;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {label}
    </span>
  );
}
