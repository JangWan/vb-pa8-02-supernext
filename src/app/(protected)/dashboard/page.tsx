"use client";

import { LayoutDashboard } from "lucide-react";
import { UserAvatarButton } from "@/features/user-profile/components/UserAvatarButton";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { UserInfoPanel } from "@/features/dashboard/components/UserInfoPanel";
import { SystemInfoPanel } from "@/features/dashboard/components/SystemInfoPanel";
import { WebInfoPanel } from "@/features/dashboard/components/WebInfoPanel";
import { DatabaseInfoPanel } from "@/features/dashboard/components/DatabaseInfoPanel";
import { ServiceStatusPanel } from "@/features/dashboard/components/ServiceStatusPanel";

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="h-5 w-5 text-indigo-500" />
            <h1 className="text-lg font-semibold text-slate-800">시스템 대시보드</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>{user?.email}</span>
            <UserAvatarButton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <UserInfoPanel />
          <ServiceStatusPanel />
          <WebInfoPanel />
          <DatabaseInfoPanel />
          <div className="xl:col-span-2">
            <SystemInfoPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
