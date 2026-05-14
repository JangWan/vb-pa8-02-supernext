"use client";

import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Monitor } from "lucide-react";
import { DashboardCard, InfoRow, StatusBadge } from "./DashboardCard";
import { parseDeviceInfo } from "@/features/user-profile/hooks/useSessionInfo";

// ─── 타입 ──────────────────────────────────────────────────────

type KVItem = { key: string; value: string };

// ─── 스토리지/쿠키 읽기 ────────────────────────────────────────

const readStorage = (storage: Storage): KVItem[] =>
  Array.from({ length: storage.length }, (_, i) => {
    const key = storage.key(i) ?? "";
    return { key, value: storage.getItem(key) ?? "" };
  });

const readCookies = (): KVItem[] => {
  if (!document.cookie) return [];
  return document.cookie.split(";").map((c) => {
    const eq = c.indexOf("=");
    return {
      key: c.slice(0, eq).trim(),
      value: c.slice(eq + 1).trim(),
    };
  });
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const calcStorageSize = (storage: Storage): string => {
  try {
    let total = 0;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i) ?? "";
      total += key.length + (storage.getItem(key)?.length ?? 0);
    }
    return formatBytes(total * 2);
  } catch {
    return "N/A";
  }
};

const truncate = (s: string, max = 48) =>
  s.length > max ? `${s.slice(0, max)}…` : s;

// ─── 포털 오버레이 ─────────────────────────────────────────────

type PortalOverlayProps = {
  label: string;
  items: KVItem[];
  emptyText: string;
  anchorRect: DOMRect;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

function PortalOverlay({
  label,
  items,
  emptyText,
  anchorRect,
  onMouseEnter,
  onMouseLeave,
}: PortalOverlayProps) {
  const OVERLAY_WIDTH = 320;
  const MARGIN = 8;
  const top = anchorRect.bottom + MARGIN;
  const rawLeft = anchorRect.right - OVERLAY_WIDTH;
  const left = Math.max(MARGIN, Math.min(rawLeft, window.innerWidth - OVERLAY_WIDTH - MARGIN));

  return createPortal(
    <div
      style={{ position: "fixed", top, left, width: OVERLAY_WIDTH, zIndex: 9999 }}
      className="rounded-lg border border-slate-200 bg-white shadow-xl"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="border-b border-slate-100 px-3 py-2">
        <p className="text-xs font-semibold text-slate-600">
          {label} ({items.length}개)
        </p>
      </div>
      {items.length === 0 ? (
        <p className="px-3 py-3 text-xs text-slate-400">{emptyText}</p>
      ) : (
        <ul className="max-h-72 overflow-y-auto divide-y divide-slate-50">
          {items.map((item, i) => (
            <li key={`${item.key}-${i}`} className="px-3 py-2">
              <p className="text-xs font-mono font-semibold text-indigo-700 truncate">
                {item.key || "(빈 키)"}
              </p>
              <p className="text-xs font-mono text-slate-500 mt-0.5 break-all">
                {truncate(item.value) || "(빈 값)"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>,
    document.body
  );
}

// ─── 호버 트리거 ───────────────────────────────────────────────

type HoverTriggerProps = {
  count: number;
  label: string;
  items: KVItem[];
  emptyText: string;
};

function HoverTrigger({ count, label, items, emptyText }: HoverTriggerProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setOpen(true);
  };

  const hide = () => {
    timerRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="cursor-help underline decoration-dotted decoration-slate-400 text-slate-800 select-none"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {count}개
      </span>

      {mounted && open && rect && (
        <PortalOverlay
          label={label}
          items={items}
          emptyText={emptyText}
          anchorRect={rect}
          onMouseEnter={show}
          onMouseLeave={hide}
        />
      )}
    </>
  );
}

// ─── WebInfoPanel ───────────────────────────────────────────────

type WebSnapshot = {
  localItems: KVItem[];
  sessionItems: KVItem[];
  cookieItems: KVItem[];
  localCount: number;
  localSize: string;
  sessionCount: number;
  cookieCount: number;
  browser: string;
  os: string;
  deviceType: string;
  language: string;
  timezone: string;
  screenResolution: string;
  viewportSize: string;
  colorScheme: string;
  onlineStatus: boolean;
  networkType: string;
};

const captureSnapshot = (): WebSnapshot => {
  const ua = navigator.userAgent;
  const { os, browser, deviceType } = parseDeviceInfo(ua);
  const nav = navigator as Navigator & { connection?: { effectiveType?: string } };

  const localItems = readStorage(localStorage);
  const sessionItems = readStorage(sessionStorage);
  const cookieItems = readCookies();

  return {
    localItems,
    sessionItems,
    cookieItems,
    localCount: localStorage.length,
    localSize: calcStorageSize(localStorage),
    sessionCount: sessionStorage.length,
    cookieCount: cookieItems.length,
    browser,
    os,
    deviceType,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${screen.width} × ${screen.height}`,
    viewportSize: `${window.innerWidth} × ${window.innerHeight}`,
    colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "다크" : "라이트",
    onlineStatus: navigator.onLine,
    networkType: nav.connection?.effectiveType ?? "N/A",
  };
};

export function WebInfoPanel() {
  const [snapshot, setSnapshot] = useState<WebSnapshot | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const refresh = useCallback(() => {
    const s = captureSnapshot();
    setSnapshot(s);
    setLastUpdated(Date.now());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!snapshot) return null;

  return (
    <DashboardCard
      title="브라우저 & Web 정보"
      icon={<Monitor className="h-4 w-4" />}
      onRefresh={refresh}
      lastUpdated={lastUpdated}
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            브라우저 환경
          </p>
          <InfoRow label="브라우저" value={snapshot.browser} />
          <InfoRow label="OS" value={snapshot.os} />
          <InfoRow label="디바이스" value={snapshot.deviceType} />
          <InfoRow label="언어" value={snapshot.language} />
          <InfoRow label="타임존" value={snapshot.timezone} />
          <InfoRow label="화면 해상도" value={snapshot.screenResolution} />
          <InfoRow label="뷰포트 크기" value={snapshot.viewportSize} />
          <InfoRow label="색상 테마" value={snapshot.colorScheme} />
          <InfoRow label="네트워크" value={snapshot.networkType.toUpperCase()} />
          <InfoRow
            label="온라인 상태"
            value={
              <StatusBadge
                status={snapshot.onlineStatus ? "online" : "offline"}
                label={snapshot.onlineStatus ? "온라인" : "오프라인"}
              />
            }
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            스토리지
          </p>
          <InfoRow
            label="localStorage 항목 수"
            value={
              <HoverTrigger
                count={snapshot.localCount}
                label="localStorage"
                items={snapshot.localItems}
                emptyText="항목이 없습니다."
              />
            }
          />
          <InfoRow label="localStorage 용량" value={snapshot.localSize} />
          <InfoRow
            label="sessionStorage 항목 수"
            value={
              <HoverTrigger
                count={snapshot.sessionCount}
                label="sessionStorage"
                items={snapshot.sessionItems}
                emptyText="항목이 없습니다."
              />
            }
          />
          <InfoRow
            label="쿠키 수"
            value={
              <HoverTrigger
                count={snapshot.cookieCount}
                label="쿠키"
                items={snapshot.cookieItems}
                emptyText="쿠키가 없습니다."
              />
            }
          />
        </div>
      </div>
    </DashboardCard>
  );
}
