"use client";

import { Activity, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { DashboardCard, StatusBadge } from "./DashboardCard";
import { useDashboardServices } from "../hooks/useDashboardQuery";
import type { ServiceStatusItem } from "../backend/schema";

type IndicatorStatus = "online" | "warning" | "offline" | "unknown";

const indicatorToStatus = (
  indicator: ServiceStatusItem["indicator"]
): IndicatorStatus => {
  const map: Record<ServiceStatusItem["indicator"], IndicatorStatus> = {
    none: "online",
    minor: "warning",
    major: "offline",
    critical: "offline",
    unknown: "unknown",
  };
  return map[indicator];
};

const indicatorToLabel = (indicator: ServiceStatusItem["indicator"]) => {
  const map: Record<ServiceStatusItem["indicator"], string> = {
    none: "정상",
    minor: "부분 장애",
    major: "장애",
    critical: "주요 장애",
    unknown: "확인 불가",
  };
  return map[indicator];
};

export function ServiceStatusPanel() {
  const { data, isLoading, refetch, dataUpdatedAt } = useDashboardServices();

  return (
    <DashboardCard
      title="외부 서비스 상태"
      icon={<Activity className="h-4 w-4" />}
      isLoading={isLoading}
      onRefresh={() => { void refetch(); }}
      lastUpdated={dataUpdatedAt}
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : !data?.services ? (
        <p className="text-sm text-slate-400">서비스 상태를 불러올 수 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {data.services.map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <StatusBadge
                  status={indicatorToStatus(svc.indicator)}
                  label={indicatorToLabel(svc.indicator)}
                />
                <div>
                  <p className="text-sm font-medium text-slate-700">{svc.name}</p>
                  <p className="text-xs text-slate-400">{svc.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <a
                  href={svc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline"
                >
                  상태 페이지 <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-xs text-slate-400">
                  {format(new Date(svc.checkedAt), "HH:mm:ss")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
