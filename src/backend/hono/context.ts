import type { Context } from 'hono';

export type AppLogger = Pick<Console, 'info' | 'error' | 'warn' | 'debug'>;

export type AppVariables = {
  logger: AppLogger;
};

export type AppEnv = {
  Variables: AppVariables;
};

export type AppContext = Context<AppEnv>;

export const contextKeys = {
  logger: 'logger',
} as const satisfies Record<keyof AppVariables, keyof AppVariables>;

export const getLogger = (c: AppContext) =>
  c.get(contextKeys.logger) as AppLogger;
