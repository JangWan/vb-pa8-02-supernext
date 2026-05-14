"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UserRound, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileTab } from "./tabs/ProfileTab";
import { AccountInfoTab } from "./tabs/AccountInfoTab";

type Tab = "profile" | "account";

const tabs = [
  { id: "profile" as Tab, label: "프로필 수정", icon: UserRound },
  { id: "account" as Tab, label: "계정 정보", icon: Info },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AccountManagementModal({ open, onClose }: Props) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.emailAddresses[0]?.emailAddress ||
    "사용자";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="overflow-hidden rounded-xl border border-slate-200 p-0 shadow-lg sm:max-w-2xl">
        <DialogTitle className="sr-only">계정 관리</DialogTitle>
        <div className="flex min-h-[520px]">
          {/* 왼쪽 메뉴 */}
          <aside className="flex w-52 flex-shrink-0 flex-col border-r border-slate-100 bg-slate-50 p-4">
            {/* 사용자 요약 */}
            <div className="mb-4 flex items-center gap-3 px-1 py-2">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={user?.imageUrl} alt={displayName} />
                <AvatarFallback className="bg-slate-200 text-sm font-medium text-slate-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {displayName}
                </p>
                <p className="truncate text-xs text-slate-500">계정 관리</p>
              </div>
            </div>

            {/* 메뉴 */}
            <nav className="flex flex-col gap-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={[
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                    activeTab === id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-white/60 hover:text-slate-900",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* 오른쪽 콘텐츠 */}
          <main className="flex-1 overflow-y-auto p-6">
            {activeTab === "profile" && <ProfileTab />}
            {activeTab === "account" && <AccountInfoTab />}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
