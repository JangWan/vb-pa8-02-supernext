BEGIN;

-- users → sn_users
ALTER TABLE IF EXISTS public.users RENAME TO sn_users;

-- 인덱스 이름도 일관성 유지
ALTER INDEX IF EXISTS idx_users_clerk_id RENAME TO idx_sn_users_clerk_id;
ALTER INDEX IF EXISTS idx_users_email    RENAME TO idx_sn_users_email;

-- 트리거도 재생성 (이름 변경은 지원 안 되므로 drop → create)
DROP TRIGGER IF EXISTS set_users_updated_at ON public.sn_users;

CREATE TRIGGER set_sn_users_updated_at
BEFORE UPDATE ON public.sn_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- example → sn_example
ALTER TABLE IF EXISTS public.example RENAME TO sn_example;

COMMIT;
