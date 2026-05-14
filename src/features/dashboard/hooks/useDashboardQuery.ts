"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import type { SystemInfo, DatabaseInfo, ServicesStatus } from "../backend/schema";

export const useDashboardSystem = () =>
  useQuery({
    queryKey: ["dashboard", "system"],
    queryFn: async () => {
      const res = await apiClient.get<SystemInfo>("/api/dashboard/system");
      return res.data;
    },
    staleTime: Infinity,
  });

export const useDashboardDb = () =>
  useQuery({
    queryKey: ["dashboard", "db"],
    queryFn: async () => {
      const res = await apiClient.get<DatabaseInfo>("/api/dashboard/db");
      return res.data;
    },
    staleTime: Infinity,
  });

export const useDashboardServices = () =>
  useQuery({
    queryKey: ["dashboard", "services"],
    queryFn: async () => {
      const res = await apiClient.get<ServicesStatus>("/api/dashboard/services");
      const data = res.data as ServicesStatus & { error?: unknown };
      if (data?.error) throw new Error("services status api error");
      return data;
    },
    staleTime: Infinity,
  });
