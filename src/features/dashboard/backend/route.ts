import type { Hono } from 'hono';
import { respond } from '@/backend/http/response';
import type { AppEnv } from '@/backend/hono/context';
import { getSystemInfo, getDatabaseInfo, getServicesStatus } from './service';

export const registerDashboardRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/dashboard/system', (c) => {
    const result = getSystemInfo();
    return respond(c, result);
  });

  app.get('/api/dashboard/db', async (c) => {
    const result = await getDatabaseInfo();
    return respond(c, result);
  });

  app.get('/api/dashboard/services', async (c) => {
    const result = await getServicesStatus();
    return respond(c, result);
  });
};
