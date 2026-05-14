export type DbProvider = 'supabase' | 'neon';

export const DB_PROVIDERS = ['supabase', 'neon'] as const;

export const getDbProvider = (): DbProvider => {
  const provider = process.env.DB_PROVIDER;
  if (provider === 'neon') return 'neon';
  return 'supabase';
};

export const getDbConnectionUrl = (provider: DbProvider): string => {
  if (provider === 'neon') {
    const url = process.env.NEON_DATABASE_URL;
    if (!url) throw new Error('NEON_DATABASE_URL 환경 변수가 설정되지 않았습니다.');
    return url;
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
  return url;
};
