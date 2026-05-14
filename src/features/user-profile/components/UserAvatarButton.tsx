"use client";

import { useState, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountManagementModal } from "./AccountManagementModal";

export function UserAvatarButton() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace("/");
  }, [signOut, router]);

  if (!isLoaded || !user) return null;

  const initials =
    [user.firstName?.[0], user.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ||
    "?";

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.emailAddresses[0]?.emailAddress ||
    "사용자";

  const email = user.emailAddresses[0]?.emailAddress ?? "";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded-full outline-none ring-2 ring-slate-600 ring-offset-2 ring-offset-slate-900 transition hover:ring-slate-400 focus-visible:ring-slate-400"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.imageUrl} alt={displayName} />
              <AvatarFallback className="bg-slate-700 text-sm font-medium text-slate-200">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          <DropdownMenuLabel className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-slate-900">
              {displayName}
            </p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-slate-100" />

          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 focus:bg-slate-50"
            onSelect={() => setModalOpen(true)}
          >
            <Settings className="h-4 w-4 text-slate-400" />
            계정 관리
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-slate-100" />

          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 focus:bg-slate-50"
            onSelect={handleSignOut}
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountManagementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
