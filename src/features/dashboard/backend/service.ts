import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';
import { db } from '@/backend/db';
import { getDbProvider } from '@/backend/db/provider';
import { success, failure } from '@/backend/http/response';
import type { SystemInfo, DatabaseInfo, ServicesStatus, ServiceStatusItem } from './schema';

// ─── 시스템 정보 ───────────────────────────────────────────────

type PackageJson = {
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

const KEY_PACKAGES: Array<{ name: string; category: string }> = [
  { name: 'next', category: '프레임워크' },
  { name: 'react', category: '프레임워크' },
  { name: '@clerk/nextjs', category: '인증' },
  { name: 'hono', category: 'API' },
  { name: 'drizzle-orm', category: 'ORM' },
  { name: '@tanstack/react-query', category: '상태관리' },
  { name: 'zustand', category: '상태관리' },
  { name: 'zod', category: '검증' },
  { name: 'typescript', category: '언어' },
  { name: 'tailwindcss', category: 'UI' },
  { name: 'axios', category: 'HTTP' },
  { name: 'framer-motion', category: 'UI' },
];

const readPackageJson = (): PackageJson => {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const raw = fs.readFileSync(pkgPath, 'utf-8');
  return JSON.parse(raw) as PackageJson;
};

const cleanVersion = (v: string) => v.replace(/^[\^~>=<]+/, '');

export const getSystemInfo = () => {
  try {
    const pkg = readPackageJson();
    const all = { ...pkg.dependencies, ...pkg.devDependencies };

    const packages = KEY_PACKAGES.map(({ name, category }) => ({
      name,
      version: all[name] ? cleanVersion(all[name]) : 'N/A',
      category,
    }));

    const info: SystemInfo = {
      nodeVersion: process.version,
      nextVersion: cleanVersion(all['next'] ?? 'N/A'),
      environment: process.env.NODE_ENV ?? 'unknown',
      dbProvider: getDbProvider(),
      projectVersion: pkg.version,
      packages,
    };

    return success(info);
  } catch (e) {
    return failure(500, 'SYSTEM_INFO_ERROR', e instanceof Error ? e.message : 'Unknown error');
  }
};

// ─── DB 정보 ───────────────────────────────────────────────────

type Row = Record<string, unknown>;

const execSql = async <T extends Row>(query: ReturnType<typeof sql>): Promise<T[]> => {
  const result = await db.execute(query);
  return result as unknown as T[];
};

export const getDatabaseInfo = async () => {
  const provider = getDbProvider();

  try {
    const [
      versionRows,
      dbMetaRows,
      connectionRows,
      maxConnRows,
      cacheRows,
      indexCountRows,
      uptimeRows,
      tableRows,
    ] = await Promise.all([
      execSql<{ version: string }>(
        sql`SELECT version() AS version`
      ),
      execSql<{ db_name: string; db_user: string; db_size: string }>(
        sql`SELECT
          current_database() AS db_name,
          current_user AS db_user,
          pg_size_pretty(pg_database_size(current_database())) AS db_size`
      ),
      execSql<{ active: string }>(
        sql`SELECT count(*) AS active
            FROM pg_stat_activity
            WHERE state = 'active' AND datname = current_database()`
      ),
      execSql<{ max_conn: string }>(
        sql`SELECT setting AS max_conn FROM pg_settings WHERE name = 'max_connections'`
      ),
      execSql<{ hit_rate: string | null }>(
        sql`SELECT
          ROUND(
            sum(heap_blks_hit)::numeric /
            NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100,
            2
          ) AS hit_rate
          FROM pg_statio_user_tables`
      ),
      execSql<{ idx_count: string }>(
        sql`SELECT count(*) AS idx_count
            FROM pg_indexes
            WHERE schemaname NOT IN ('pg_catalog', 'information_schema')`
      ),
      execSql<{ uptime: string }>(
        sql`SELECT
          date_trunc('second', now() - pg_postmaster_start_time()) AS uptime`
      ),
      execSql<{ tablename: string; row_count: string | null; table_size: string | null; index_count: string }>(
        sql`SELECT
          t.tablename,
          s.n_live_tup AS row_count,
          pg_size_pretty(pg_total_relation_size(t.schemaname || '.' || t.tablename)) AS table_size,
          COALESCE(i.idx_count, 0) AS index_count
        FROM pg_tables t
        LEFT JOIN pg_stat_user_tables s
          ON s.schemaname = t.schemaname AND s.relname = t.tablename
        LEFT JOIN (
          SELECT tablename, count(*) AS idx_count
          FROM pg_indexes
          WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
          GROUP BY tablename
        ) i ON i.tablename = t.tablename
        WHERE t.schemaname NOT IN ('pg_catalog', 'information_schema')
        ORDER BY t.tablename`
      ),
    ]);

    const rawVersion = versionRows[0]?.version ?? 'N/A';
    const shortVersion = rawVersion.match(/PostgreSQL ([\d.]+)/)?.[1] ?? rawVersion;

    const dbMeta = dbMetaRows[0];
    const cacheHitRaw = cacheRows[0]?.hit_rate;

    const tables = tableRows.map((row) => ({
      tableName: row.tablename,
      rowCount: Number(row.row_count ?? 0),
      tableSize: row.table_size ?? '0 bytes',
      indexCount: Number(row.index_count ?? 0),
    }));

    const info: DatabaseInfo = {
      provider,
      postgresVersion: shortVersion,
      connectionStatus: 'connected',
      currentDatabase: dbMeta?.db_name ?? 'N/A',
      currentUser: dbMeta?.db_user ?? 'N/A',
      databaseSize: dbMeta?.db_size ?? 'N/A',
      maxConnections: Number(maxConnRows[0]?.max_conn ?? 0),
      activeConnections: Number(connectionRows[0]?.active ?? 0),
      cacheHitRate: cacheHitRaw != null ? Number(cacheHitRaw) : null,
      totalIndexes: Number(indexCountRows[0]?.idx_count ?? 0),
      uptime: String(uptimeRows[0]?.uptime ?? 'N/A'),
      tables,
    };

    return success(info);
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : 'Unknown error';
    const info: DatabaseInfo = {
      provider,
      postgresVersion: 'N/A',
      connectionStatus: 'error',
      connectionError: errMsg,
      currentDatabase: 'N/A',
      currentUser: 'N/A',
      databaseSize: 'N/A',
      maxConnections: 0,
      activeConnections: 0,
      cacheHitRate: null,
      totalIndexes: 0,
      uptime: 'N/A',
      tables: [],
    };
    return success(info);
  }
};

// ─── 외부 서비스 상태 ──────────────────────────────────────────

type StatuspageResponse = {
  status?: { indicator?: string; description?: string };
};

type StatusIoResponse = {
  result?: {
    status_overall?: { status?: string; status_code?: number };
  };
};

type ServiceConfig =
  | { type: 'atlassian'; name: string; apiUrl: string; pageUrl: string }
  | { type: 'statusio'; name: string; apiUrl: string; pageUrl: string };

const STATUS_SERVICES: ServiceConfig[] = [
  {
    type: 'atlassian',
    name: 'Clerk',
    apiUrl: 'https://status.clerk.com/api/v2/status.json',
    pageUrl: 'https://status.clerk.com',
  },
  {
    type: 'atlassian',
    name: 'Supabase',
    apiUrl: 'https://status.supabase.com/api/v2/status.json',
    pageUrl: 'https://status.supabase.com',
  },
  {
    type: 'statusio',
    name: 'Neon',
    apiUrl: 'https://api.status.io/1.0/status/6878fc85709daa75be6c7e3c',
    pageUrl: 'https://neonstatus.com',
  },
];

const VALID_INDICATORS = ['none', 'minor', 'major', 'critical'] as const;
type ValidIndicator = (typeof VALID_INDICATORS)[number];

const toIndicator = (raw: string | undefined): ServiceStatusItem['indicator'] => {
  if (VALID_INDICATORS.includes(raw as ValidIndicator)) return raw as ValidIndicator;
  return 'unknown';
};

// status.io의 status_code를 indicator로 변환
const statusIoCodeToIndicator = (code: number | undefined): ServiceStatusItem['indicator'] => {
  if (code === undefined) return 'unknown';
  if (code === 100) return 'none';
  if (code <= 200) return 'minor';
  if (code <= 300) return 'major';
  return 'critical';
};

const fetchServiceStatus = async (svc: ServiceConfig): Promise<ServiceStatusItem> => {
  const checkedAt = new Date().toISOString();
  try {
    const res = await fetch(svc.apiUrl, {
      signal: AbortSignal.timeout(6000),
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      return { name: svc.name, indicator: 'unknown', description: `HTTP ${res.status}`, url: svc.pageUrl, checkedAt };
    }

    if (svc.type === 'statusio') {
      const data = (await res.json()) as StatusIoResponse;
      const overall = data.result?.status_overall;
      return {
        name: svc.name,
        indicator: statusIoCodeToIndicator(overall?.status_code),
        description: overall?.status ?? '알 수 없음',
        url: svc.pageUrl,
        checkedAt,
      };
    }

    // atlassian statuspage
    const data = (await res.json()) as StatuspageResponse;
    return {
      name: svc.name,
      indicator: toIndicator(data.status?.indicator),
      description: data.status?.description ?? '알 수 없음',
      url: svc.pageUrl,
      checkedAt,
    };
  } catch (e) {
    const reason = e instanceof Error && e.name === 'TimeoutError' ? '타임아웃' : '연결 실패';
    return { name: svc.name, indicator: 'unknown', description: reason, url: svc.pageUrl, checkedAt };
  }
};

export const getServicesStatus = async () => {
  try {
    const services = await Promise.all(STATUS_SERVICES.map(fetchServiceStatus));
    const result: ServicesStatus = { services };
    return success(result);
  } catch (e) {
    return failure(500, 'SERVICES_STATUS_ERROR', e instanceof Error ? e.message : 'Unknown error');
  }
};
