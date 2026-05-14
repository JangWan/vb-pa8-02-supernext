"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { Monitor, Globe, Cpu } from "lucide-react";
import {
  useSessionInfo,
  parseDeviceInfo,
} from "@/features/user-profile/hooks/useSessionInfo";

export function AccountInfoTab() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { data: sessionInfo } = useSessionInfo();
  const [deviceInfo, setDeviceInfo] = useState<{
    os: string;
    browser: string;
    deviceType: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setDeviceInfo(parseDeviceInfo(navigator.userAgent));
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!user) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await user.delete();
      await signOut();
      router.replace("/");
    } catch (e) {
      setDeleteError(
        e instanceof Error ? e.message : "계정 삭제에 실패했습니다."
      );
      setIsDeleting(false);
    }
  }, [user, signOut, router]);

  const email = user?.emailAddresses[0]?.emailAddress ?? "-";
  const createdAt = user?.createdAt
    ? format(new Date(user.createdAt), "yyyy년 MM월 dd일", { locale: ko })
    : "-";
  const lastSignIn = user?.lastSignInAt
    ? format(new Date(user.lastSignInAt), "yyyy년 MM월 dd일 HH:mm", {
        locale: ko,
      })
    : "-";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-base font-semibold text-slate-900">계정 정보</p>
        <p className="mt-1 text-sm text-slate-500">계정 및 접속 기기 정보입니다.</p>
      </div>

      {/* 계정 정보 */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          기본 정보
        </p>
        <InfoRow label="이메일" value={email} />
        <InfoRow label="가입일" value={createdAt} />
        <InfoRow label="마지막 로그인" value={lastSignIn} />
      </div>

      {/* 접속 기기 정보 */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          현재 접속 기기
        </p>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <DeviceRow
              icon={<Monitor className="h-4 w-4" />}
              label="브라우저"
              value={deviceInfo?.browser ?? "-"}
            />
            <DeviceRow
              icon={<Cpu className="h-4 w-4" />}
              label="운영체제"
              value={deviceInfo?.os ?? "-"}
            />
            <DeviceRow
              icon={<Monitor className="h-4 w-4" />}
              label="기기 유형"
              value={deviceInfo?.deviceType ?? "-"}
            />
            <DeviceRow
              icon={<Globe className="h-4 w-4" />}
              label="IP 주소"
              value={sessionInfo?.ip ?? "확인 중..."}
            />
          </div>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* 계정 삭제 */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900">계정 삭제</p>
          <p className="mt-1 text-xs text-slate-500">
            계정을 삭제하면 모든 데이터가 영구 삭제됩니다. 확인을 위해{" "}
            <span className="font-medium text-slate-700">계정삭제</span>를
            입력하세요.
          </p>
        </div>
        <input
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder="계정삭제"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
        />
        {deleteError && (
          <p className="text-xs text-rose-500">{deleteError}</p>
        )}
        <button
          type="button"
          disabled={deleteConfirm !== "계정삭제" || isDeleting}
          onClick={handleDelete}
          className="self-start rounded-md border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isDeleting ? "삭제 중..." : "계정 영구 삭제"}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

function DeviceRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}
