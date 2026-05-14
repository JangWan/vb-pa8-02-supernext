"use client";

import { Server } from "lucide-react";
import { DashboardCard, InfoRow } from "./DashboardCard";
import { useDashboardSystem } from "../hooks/useDashboardQuery";

const ENV_COLORS: Record<string, string> = {
  production: "text-emerald-600 font-semibold",
  development: "text-amber-600 font-semibold",
  test: "text-blue-600 font-semibold",
};

const CATEGORY_ORDER = [
  "프레임워크",
  "인증",
  "API",
  "ORM",
  "상태관리",
  "검증",
  "HTTP",
  "UI",
  "언어",
];

export function SystemInfoPanel() {
  const { data, isLoading } = useDashboardSystem();

  const grouped = data?.packages.reduce<Record<string, typeof data.packages>>(
    (acc, pkg) => {
      const key = pkg.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(pkg);
      return acc;
    },
    {}
  );

  return (
    <DashboardCard
      title="프로젝트 & 시스템 정보"
      icon={<Server className="h-4 w-4" />}
      isLoading={isLoading}
    >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      ) : !data?.packages ? (
        <p className="text-sm text-slate-400">데이터를 불러올 수 없습니다.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <InfoRow
              label="환경"
              value={
                <span className={ENV_COLORS[data.environment] ?? ""}>
                  {data.environment}
                </span>
              }
            />
            <InfoRow label="Node.js" value={data.nodeVersion} mono />
            <InfoRow label="Next.js" value={`v${data.nextVersion}`} mono />
            <InfoRow label="DB Provider" value={data.dbProvider} />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              의존성 패키지
            </p>
            <div className="space-y-3">
              {CATEGORY_ORDER.filter((cat) => grouped?.[cat]?.length).map(
                (category) => (
                  <div key={category}>
                    <p className="mb-1 text-xs text-slate-400">{category}</p>
                    <div className="grid grid-cols-2 gap-x-4">
                      {grouped![category].map((pkg) => (
                        <div
                          key={pkg.name}
                          className="flex items-center justify-between py-0.5 text-xs"
                        >
                          <span className="font-mono text-slate-700 truncate">
                            {pkg.name}
                          </span>
                          <span className="font-mono text-indigo-600 shrink-0 pl-2">
                            {pkg.version}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
