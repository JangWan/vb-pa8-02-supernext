import { z } from 'zod';

export const PackageInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  category: z.string(),
});

export const SystemInfoSchema = z.object({
  nodeVersion: z.string(),
  nextVersion: z.string(),
  environment: z.string(),
  dbProvider: z.string(),
  projectVersion: z.string(),
  packages: z.array(PackageInfoSchema),
});

export const TableInfoSchema = z.object({
  tableName: z.string(),
  rowCount: z.number(),
  tableSize: z.string(),
  indexCount: z.number(),
});

export const DatabaseInfoSchema = z.object({
  provider: z.string(),
  postgresVersion: z.string(),
  connectionStatus: z.enum(['connected', 'error']),
  connectionError: z.string().optional(),
  currentDatabase: z.string(),
  currentUser: z.string(),
  databaseSize: z.string(),
  maxConnections: z.number(),
  activeConnections: z.number(),
  cacheHitRate: z.number().nullable(),
  totalIndexes: z.number(),
  uptime: z.string(),
  tables: z.array(TableInfoSchema),
});

export const ServiceStatusItemSchema = z.object({
  name: z.string(),
  indicator: z.enum(['none', 'minor', 'major', 'critical', 'unknown']),
  description: z.string(),
  url: z.string(),
  checkedAt: z.string(),
});

export const ServicesStatusSchema = z.object({
  services: z.array(ServiceStatusItemSchema),
});

export type PackageInfo = z.infer<typeof PackageInfoSchema>;
export type SystemInfo = z.infer<typeof SystemInfoSchema>;
export type TableInfo = z.infer<typeof TableInfoSchema>;
export type DatabaseInfo = z.infer<typeof DatabaseInfoSchema>;
export type ServiceStatusItem = z.infer<typeof ServiceStatusItemSchema>;
export type ServicesStatus = z.infer<typeof ServicesStatusSchema>;
