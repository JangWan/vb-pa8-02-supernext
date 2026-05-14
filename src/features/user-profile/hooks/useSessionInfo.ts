"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";

type SessionInfo = {
  ip: string | null;
};

const fetchSessionInfo = async (): Promise<SessionInfo> => {
  const res = await apiClient.get<SessionInfo>("/api/user/session-info");
  return res.data;
};

export const useSessionInfo = () =>
  useQuery({
    queryKey: ["user-session-info"],
    queryFn: fetchSessionInfo,
    staleTime: 5 * 60 * 1000,
  });

type DeviceInfo = {
  os: string;
  browser: string;
  deviceType: string;
};

export const parseDeviceInfo = (ua: string): DeviceInfo => {
  const os = (() => {
    if (/Windows/.test(ua)) return "Windows";
    if (/Mac OS X/.test(ua)) return "macOS";
    if (/iPhone|iPad/.test(ua)) return "iOS";
    if (/Android/.test(ua)) return "Android";
    if (/Linux/.test(ua)) return "Linux";
    return "알 수 없음";
  })();

  const browser = (() => {
    if (/Edg\//.test(ua)) return "Edge";
    if (/OPR\//.test(ua)) return "Opera";
    if (/Chrome\//.test(ua)) return "Chrome";
    if (/Firefox\//.test(ua)) return "Firefox";
    if (/Safari\//.test(ua)) return "Safari";
    return "알 수 없음";
  })();

  const deviceType = /iPhone|iPad|Android|Mobile/.test(ua)
    ? "모바일"
    : "데스크톱";

  return { os, browser, deviceType };
};
