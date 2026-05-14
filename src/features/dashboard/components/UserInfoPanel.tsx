"use client";

import { useState } from "react";
import { useUser, useSession } from "@clerk/nextjs";
import { User } from "lucide-react";
import { format } from "date-fns";
import { DashboardCard, InfoRow, StatusBadge } from "./DashboardCard";

export function UserInfoPanel() {
  const { isLoaded, user } = useUser();
  const { session } = useSession();
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!user || isRefreshing) return;
    setIsRefreshing(true);
    await user.reload();
    setLastUpdated(Date.now());
    setIsRefreshing(false);
  };

  const primaryEmail = user?.emailAddresses[0];
  const emailVerified = primaryEmail?.verification?.status === "verified";

  const formatDate = (d: Date | null | undefined) =>
    d ? format(new Date(d), "yyyy-MM-dd HH:mm") : "N/A";

  return (
    <DashboardCard
      title="사용자 정보"
      icon={<User className="h-4 w-4" />}
      isLoading={!isLoaded || isRefreshing}
      onRefresh={handleRefresh}
      lastUpdated={lastUpdated}
    >
      {!isLoaded ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      ) : !user ? (
        <p className="text-sm text-slate-400">로그인된 사용자가 없습니다.</p>
      ) : (
        <div className="space-y-0">
          <InfoRow
            label="이름"
            value={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "N/A"}
          />
          <InfoRow label="이메일" value={primaryEmail?.emailAddress ?? "N/A"} mono />
          <InfoRow
            label="이메일 인증"
            value={
              <StatusBadge
                status={emailVerified ? "online" : "warning"}
                label={emailVerified ? "인증됨" : "미인증"}
              />
            }
          />
          <InfoRow
            label="MFA"
            value={
              <StatusBadge
                status={user.twoFactorEnabled ? "online" : "offline"}
                label={user.twoFactorEnabled ? "활성" : "비활성"}
              />
            }
          />
          <InfoRow label="계정 생성" value={formatDate(user.createdAt)} />
          <InfoRow label="마지막 로그인" value={formatDate(user.lastSignInAt)} />
          <InfoRow
            label="세션 만료"
            value={session?.expireAt ? formatDate(session.expireAt) : "N/A"}
          />
          {user.publicMetadata?.role && (
            <InfoRow label="역할" value={String(user.publicMetadata.role)} />
          )}
        </div>
      )}
    </DashboardCard>
  );
}
