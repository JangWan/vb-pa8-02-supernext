"use client";

import { useMemo } from "react";
import { parseDeviceInfo } from "@/features/user-profile/hooks/useSessionInfo";

export type StorageStats = {
  localStorageCount: number;
  localStorageSize: string;
  sessionStorageCount: number;
  cookieCount: number;
};

export type BrowserInfo = {
  os: string;
  browser: string;
  deviceType: string;
  language: string;
  timezone: string;
  screenResolution: string;
  viewportSize: string;
  colorScheme: string;
  onlineStatus: boolean;
  networkType: string;
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

export const useWebInfo = () => {
  const storageStats = useMemo<StorageStats>(() => {
    if (typeof window === "undefined") {
      return { localStorageCount: 0, localStorageSize: "N/A", sessionStorageCount: 0, cookieCount: 0 };
    }
    return {
      localStorageCount: localStorage.length,
      localStorageSize: calcStorageSize(localStorage),
      sessionStorageCount: sessionStorage.length,
      cookieCount: document.cookie ? document.cookie.split(";").length : 0,
    };
  }, []);

  const browserInfo = useMemo<BrowserInfo>(() => {
    if (typeof window === "undefined") {
      return {
        os: "N/A", browser: "N/A", deviceType: "N/A",
        language: "N/A", timezone: "N/A", screenResolution: "N/A",
        viewportSize: "N/A", colorScheme: "N/A", onlineStatus: true, networkType: "N/A",
      };
    }

    const { os, browser, deviceType } = parseDeviceInfo(navigator.userAgent);

    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string };
    };

    return {
      os,
      browser,
      deviceType,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width} × ${screen.height}`,
      viewportSize: `${window.innerWidth} × ${window.innerHeight}`,
      colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "다크" : "라이트",
      onlineStatus: navigator.onLine,
      networkType: nav.connection?.effectiveType ?? "N/A",
    };
  }, []);

  return { storageStats, browserInfo };
};
