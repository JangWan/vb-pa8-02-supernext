"use client";

import { Database } from "lucide-react";
import { DashboardCard, InfoRow, StatusBadge } from "./DashboardCard";
import { useDashboardDb } from "../hooks/useDashboardQuery";

const PROVIDER_LABELS: Record<string, string> = {
  supabase: "Supabase",
  neon: "Neon Serverless",
};

export function DatabaseInfoPanel() {
  const { data, isLoading, refetch, dataUpdatedAt } = useDashboardDb();

  return (
    <DashboardCard
      title="데이터베이스 정보"
      icon={<Database className="h-4 w-4" />}
      isLoading={isLoading}
      onRefresh={() => { void refetch(); }}
      lastUpdated={dataUpdatedAt}
    >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      ) : !data?.provider ? (
        <p className="text-sm text-slate-400">데이터를 불러올 수 없습니다.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              연결 정보
            </p>
            <InfoRow
              label="Provider"
              value={PROVIDER_LABELS[data.provider] ?? data.provider}
            />
            <InfoRow label="PostgreSQL" value={data.postgresVersion} mono />
            <InfoRow
              label="연결 상태"
              value={
                <StatusBadge
                  status={data.connectionStatus === "connected" ? "online" : "offline"}
                  label={data.connectionStatus === "connected" ? "연결됨" : "오류"}
                />
              }
            />
            {data.connectionError && (
              <InfoRow
                label="오류 메시지"
                value={
                  <span className="text-red-500 text-xs">{data.connectionError}</span>
                }
              />
            )}
            <InfoRow label="현재 DB" value={data.currentDatabase} mono />
            <InfoRow label="접속 사용자" value={data.currentUser} mono />
          </div>

          {data.connectionStatus === "connected" && (
            <>
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  리소스
                </p>
                <InfoRow label="DB 크기" value={data.databaseSize} />
                <InfoRow
                  label="활성 연결"
                  value={`${data.activeConnections} / ${data.maxConnections}`}
                />
                <InfoRow
                  label="캐시 히트율"
                  value={
                    data.cacheHitRate !== null ? (
                      <span
                        className={
                          data.cacheHitRate >= 90
                            ? "text-emerald-600 font-medium"
                            : data.cacheHitRate >= 70
                            ? "text-amber-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {data.cacheHitRate}%
                      </span>
                    ) : (
                      "N/A"
                    )
                  }
                />
                <InfoRow label="총 인덱스 수" value={`${data.totalIndexes}개`} />
                <InfoRow label="업타임" value={data.uptime} mono />
              </div>

              {data.tables.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    테이블 ({data.tables.length}개)
                  </p>
                  <div className="overflow-hidden rounded-lg border border-slate-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-left">
                          <th className="px-3 py-2 font-medium text-slate-500">
                            테이블명
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-slate-500">
                            행 수
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-slate-500">
                            인덱스
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-slate-500">
                            크기
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.tables.map((table, i) => (
                          <tr
                            key={table.tableName}
                            className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                          >
                            <td className="px-3 py-2 font-mono text-slate-700">
                              {table.tableName}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600">
                              {table.rowCount.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-500">
                              {table.indexCount}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-500">
                              {table.tableSize}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {data.tables.length === 0 && (
                <p className="text-sm text-slate-400">조회된 테이블이 없습니다.</p>
              )}
            </>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
