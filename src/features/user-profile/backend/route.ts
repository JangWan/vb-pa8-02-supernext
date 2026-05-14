import { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { success, respond } from '@/backend/http/response';

export const registerUserProfileRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/user/session-info', (c) => {
    const ip =
      c.req.header('cf-connecting-ip') ??
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
      c.req.header('x-real-ip') ??
      null;

    return respond(c, success({ ip }));
  });
};
