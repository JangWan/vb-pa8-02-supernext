import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { getDbProvider, getDbConnectionUrl } from './provider';

export type { DbProvider } from './provider';

// HMR 대응 싱글턴 (개발 환경에서 연결 수 폭증 방지)
const globalForDb = globalThis as unknown as {
  _pgClient: ReturnType<typeof postgres> | undefined;
  _dbProvider: string | undefined;
};

export const dbProvider = getDbProvider();
const connectionUrl = getDbConnectionUrl(dbProvider);

// 프로바이더 변경 시 기존 연결 재사용 방지
const isSameProvider = globalForDb._dbProvider === dbProvider;
const client =
  (isSameProvider && globalForDb._pgClient) || postgres(connectionUrl);

if (process.env.NODE_ENV !== 'production') {
  globalForDb._pgClient = client;
  globalForDb._dbProvider = dbProvider;
}

export const db = drizzle(client, { schema });
