import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// HMR 대응 싱글턴 (개발 환경에서 연결 수 폭증 방지)
const globalForDb = globalThis as unknown as {
  _pgClient: ReturnType<typeof postgres> | undefined;
};

const client = globalForDb._pgClient ?? postgres(process.env.DATABASE_URL!);

if (process.env.NODE_ENV !== 'production') {
  globalForDb._pgClient = client;
}

export const db = drizzle(client, { schema });
