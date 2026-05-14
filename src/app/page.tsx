"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Shield,
  Database,
  Server,
  Layers,
  Terminal,
  Wrench,
  ExternalLink,
  GitBranch,
  Boxes,
  Key,
  Zap,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { UserAvatarButton } from "@/features/user-profile/components/UserAvatarButton";

// ─────────────────────────────────────────────
// 공통 UI 컴포넌트
// ─────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied ? "복사됨" : "복사"}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative rounded-lg border border-slate-800 bg-slate-950">
      <div className="absolute right-2 top-2">
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 pr-20 text-sm text-slate-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function StepHeader({
  step,
  title,
  description,
  icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
        {step}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-indigo-300">{icon}</span>
          <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
        </div>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function SubStep({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-6 w-6 shrink-0 mt-0.5 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300">
        {number}
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium text-slate-200">{title}</p>
        {children}
      </div>
    </div>
  );
}

function EnvVar({
  varKey,
  description,
  example,
}: {
  varKey: string;
  description: string;
  example?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 space-y-1">
      <code className="text-sm font-medium text-emerald-300">{varKey}</code>
      <p className="text-xs text-slate-400">{description}</p>
      {example && (
        <code className="block text-xs text-slate-500">{example}</code>
      )}
    </div>
  );
}

function InfoBox({
  type,
  children,
}: {
  type: "warning" | "info";
  children: React.ReactNode;
}) {
  const styles =
    type === "warning"
      ? "border-amber-900/50 bg-amber-950/20 text-amber-300"
      : "border-blue-900/50 bg-blue-950/20 text-blue-300";
  return (
    <div className={`rounded-lg border p-3 text-xs ${styles}`}>{children}</div>
  );
}

// ─────────────────────────────────────────────
// STEP 1: 의존성 설치
// ─────────────────────────────────────────────

function Step1Install() {
  return (
    <div id="step-1" className="scroll-mt-6 space-y-6 rounded-xl border border-slate-700 bg-slate-900/60 p-6">
      <StepHeader
        step={1}
        title="의존성 설치"
        description="프로젝트를 클론한 후 패키지를 설치합니다."
        icon={<Terminal className="h-5 w-5" />}
      />
      <div className="ml-14 space-y-5">
        <SubStep number={1} title="레포지토리 클론">
          <CodeBlock code={"git clone <repository-url>\ncd <project-name>"} />
        </SubStep>
        <SubStep number={2} title="패키지 설치">
          <CodeBlock code="npm install" />
        </SubStep>
        <SubStep number={3} title="정적 점검 (선택)">
          <CodeBlock code="npm run lint" />
        </SubStep>
        <InfoBox type="warning">
          ⚠️ 아직 <code className="font-mono">.env.local</code>을 설정하지 않았으므로 개발 서버는{" "}
          <strong>STEP 5</strong>에서 실행합니다.
        </InfoBox>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 2: Clerk 인증 설정
// ─────────────────────────────────────────────

function Step2Clerk() {
  return (
    <div id="step-2" className="scroll-mt-6 space-y-6 rounded-xl border border-slate-700 bg-slate-900/60 p-6">
      <StepHeader
        step={2}
        title="Clerk 인증 설정"
        description="회원가입 · 로그인 · Webhook 사용자 동기화를 위해 Clerk 앱을 설정합니다."
        icon={<Shield className="h-5 w-5" />}
      />
      <div className="ml-14 space-y-6">
        <SubStep number={1} title="Clerk 앱 생성">
          <p className="text-xs text-slate-400">
            <a
              href="https://clerk.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
            >
              clerk.com <ExternalLink className="h-3 w-3" />
            </a>{" "}
            에서 <strong className="text-slate-200">Create application</strong>을 클릭합니다.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              Sign-in 방식: <strong className="text-slate-300">Email address + Password</strong> 선택
            </li>
            <li className="flex items-center gap-2">
              <span className="text-slate-500">✗</span>
              소셜 로그인 (Google, GitHub 등): 모두 해제
            </li>
          </ul>
        </SubStep>

        <SubStep number={2} title="API 키 확인">
          <p className="text-xs text-slate-400">
            Clerk 대시보드 → <strong className="text-slate-300">API Keys</strong> 메뉴
          </p>
          <div className="mt-2 space-y-2">
            <EnvVar
              varKey="NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
              description="클라이언트 공개 키 (pk_test_... 형식)"
            />
            <EnvVar
              varKey="CLERK_SECRET_KEY"
              description="서버 전용 비밀 키 (sk_test_... 형식) — 절대 클라이언트에 노출 금지"
            />
          </div>
        </SubStep>

        <SubStep number={3} title="Webhook 엔드포인트 등록">
          <p className="text-xs text-slate-400">
            Clerk 대시보드 → <strong className="text-slate-300">Webhooks</strong> →{" "}
            <strong className="text-slate-300">Add Endpoint</strong>
          </p>
          <div className="mt-2 space-y-3 text-xs text-slate-400">
            <div className="space-y-2">
              <p>
                <strong className="text-slate-300">로컬 개발</strong> (ngrok, STEP 6 참고):
              </p>
              <CodeBlock code="https://<ngrok-id>.ngrok.io/api/webhooks/clerk" />
              <p>
                <strong className="text-slate-300">프로덕션 (Vercel):</strong>
              </p>
              <CodeBlock code="https://<your-domain>/api/webhooks/clerk" />
            </div>
            <div>
              <p className="mb-1">
                <strong className="text-slate-300">Subscribe to events</strong> — 아래 3가지 반드시 체크:
              </p>
              <ul className="space-y-1 pl-2">
                {["user.created", "user.updated", "user.deleted"].map((e) => (
                  <li key={e} className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <code>{e}</code>
                  </li>
                ))}
              </ul>
            </div>
            <p>
              엔드포인트 생성 후 <strong className="text-slate-300">Signing Secret</strong> 복사 (
              <code>whsec_...</code>)
            </p>
          </div>
        </SubStep>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 3: 데이터베이스 설정
// ─────────────────────────────────────────────

function Step3Database() {
  const [activeTab, setActiveTab] = useState<"supabase" | "neon">("supabase");

  return (
    <div id="step-3" className="scroll-mt-6 space-y-6 rounded-xl border border-slate-700 bg-slate-900/60 p-6">
      <StepHeader
        step={3}
        title="데이터베이스 설정"
        description="Supabase 또는 Neon 중 하나를 선택합니다. DB_PROVIDER 환경변수로 언제든 전환 가능합니다."
        icon={<Database className="h-5 w-5" />}
      />
      <div className="ml-14 space-y-5">
        <div className="flex gap-2">
          {(["supabase", "neon"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === "supabase" ? "Supabase" : "Neon"}
            </button>
          ))}
        </div>

        {activeTab === "supabase" ? (
          <div className="space-y-6">
            <SubStep number={1} title="Supabase 프로젝트 생성">
              <p className="text-xs text-slate-400">
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
                >
                  supabase.com <ExternalLink className="h-3 w-3" />
                </a>{" "}
                → <strong className="text-slate-300">New project</strong> 클릭
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-400 pl-2">
                <li>Organization 선택 → 프로젝트 이름 입력</li>
                <li>
                  Region:{" "}
                  <strong className="text-slate-300">Northeast Asia (Seoul)</strong> 권장
                </li>
                <li>Database Password 설정 후 반드시 복사해둡니다</li>
              </ul>
            </SubStep>

            <SubStep number={2} title="연결 문자열 확인 (Pooler)">
              <p className="text-xs text-slate-400">
                대시보드 → <strong className="text-slate-300">Project Settings → Database → Connection string</strong>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                <strong className="text-slate-300">Transaction mode</strong> 탭 선택, 포트{" "}
                <code>6543</code> 사용
              </p>
              <CodeBlock code={'DATABASE_URL="postgresql://postgres.[project-ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"'} />
            </SubStep>

            <SubStep number={3} title="마이그레이션 실행 (SQL Editor)">
              <p className="text-xs text-slate-400">
                대시보드 → <strong className="text-slate-300">SQL Editor</strong>에서 아래 파일을
                순서대로 복사해 실행합니다.
              </p>
              <div className="mt-2 space-y-2">
                {[
                  {
                    file: "supabase/migrations/0001_create_example_table.sql",
                    desc: "예시 테이블 (sn_example) + 시드 데이터",
                  },
                  {
                    file: "supabase/migrations/0002_create_users_table.sql",
                    desc: "Clerk 사용자 동기화 테이블 (sn_users)",
                  },
                ].map((m) => (
                  <div
                    key={m.file}
                    className="rounded-lg border border-slate-800 bg-slate-950/50 p-3"
                  >
                    <code className="text-xs text-amber-300">{m.file}</code>
                    <p className="mt-1 text-xs text-slate-400">{m.desc}</p>
                  </div>
                ))}
              </div>
              <InfoBox type="info">
                💡 2026년 5월 이후 신규 프로젝트는 <code>0002</code>에 포함된{" "}
                <code>GRANT ... TO service_role</code>이 필수입니다.
              </InfoBox>
            </SubStep>
          </div>
        ) : (
          <div className="space-y-6">
            <SubStep number={1} title="Neon 프로젝트 생성">
              <p className="text-xs text-slate-400">
                <a
                  href="https://neon.tech"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
                >
                  neon.tech <ExternalLink className="h-3 w-3" />
                </a>{" "}
                → <strong className="text-slate-300">New Project</strong> 클릭
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-400 pl-2">
                <li>
                  Postgres version: <strong className="text-slate-300">16 이상</strong> 권장
                </li>
                <li>
                  Region:{" "}
                  <strong className="text-slate-300">Asia Pacific (Singapore)</strong> 권장
                </li>
              </ul>
            </SubStep>

            <SubStep number={2} title="풀러 연결 문자열 확인">
              <p className="text-xs text-slate-400">
                프로젝트 생성 후{" "}
                <strong className="text-slate-300">Connection Details</strong> →{" "}
                <strong className="text-slate-300">Pooled connection</strong> ON
              </p>
              <CodeBlock code={'NEON_DATABASE_URL="postgresql://[user]:[password]@[host]-pooler.[region].aws.neon.tech/[dbname]?sslmode=require&channel_binding=require"'} />
              <p className="text-xs text-slate-500">
                호스트에 <code>-pooler</code> 접미사가 포함되어 있어야 합니다.
              </p>
            </SubStep>

            <SubStep number={3} title="마이그레이션 실행 (SQL Editor)">
              <p className="text-xs text-slate-400">
                Neon 대시보드 →{" "}
                <strong className="text-slate-300">SQL Editor</strong>에서 아래 파일을 복사해
                실행합니다.
              </p>
              <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <code className="text-xs text-amber-300">
                  neon/migrations/0001_initial_schema.sql
                </code>
                <p className="mt-1 text-xs text-slate-400">
                  전체 초기 스키마 (sn_example + sn_users 테이블, 인덱스, 트리거)
                </p>
              </div>
            </SubStep>

            <SubStep number={4} title="Neon 브랜치 활용 (선택)">
              <p className="text-xs text-slate-400">
                개발/스테이징 환경을 분리하여 프로덕션 데이터 영향 없이 개발할 수 있습니다.
              </p>
              <CodeBlock
                code={
                  "npm install -g neonctl\n\n# 인증\nneonctl auth\n\n# 개발 브랜치 생성\nneonctl branches create --name dev"
                }
              />
            </SubStep>
          </div>
        )}

        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
          <p className="mb-3 text-xs font-semibold text-slate-300">DB_PROVIDER 전환 요약</p>
          <div className="space-y-2">
            {[
              { val: "supabase (기본값, 생략 가능)", url: "DATABASE_URL", note: "Supabase Postgres" },
              { val: "neon", url: "NEON_DATABASE_URL", note: "Neon Serverless Postgres" },
            ].map((row) => (
              <div
                key={row.val}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs"
              >
                <code className="text-emerald-300">{row.val}</code>
                <span className="text-slate-500">→</span>
                <code className="text-amber-300">{row.url}</code>
                <span className="ml-auto text-slate-500">{row.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 4: 환경변수 작성
// ─────────────────────────────────────────────

const FULL_ENV_SUPABASE = `# ─── Clerk 인증 ───────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
CLERK_WEBHOOK_SIGNING_SECRET=whsec_xxxxxxxxxx

# ─── Supabase DB ───────────────────────────────
DB_PROVIDER=supabase
DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"`;

const FULL_ENV_NEON = `# ─── Clerk 인증 ───────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
CLERK_WEBHOOK_SIGNING_SECRET=whsec_xxxxxxxxxx

# ─── Neon DB ───────────────────────────────────
DB_PROVIDER=neon
NEON_DATABASE_URL="postgresql://[user]:[password]@[host]-pooler.[region].aws.neon.tech/[dbname]?sslmode=require&channel_binding=require"`;

function Step4EnvVars() {
  const [activeTab, setActiveTab] = useState<"supabase" | "neon">("supabase");

  return (
    <div id="step-4" className="scroll-mt-6 space-y-6 rounded-xl border border-slate-700 bg-slate-900/60 p-6">
      <StepHeader
        step={4}
        title=".env.local 환경변수 작성"
        description="STEP 2~3에서 발급받은 값을 프로젝트 루트의 .env.local 파일에 입력합니다."
        icon={<Key className="h-5 w-5" />}
      />
      <div className="ml-14 space-y-6">
        <SubStep number={1} title="Clerk 인증 변수 (필수)">
          <div className="space-y-2">
            <EnvVar
              varKey="NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
              description="Clerk 대시보드 → API Keys → Publishable key"
              example="pk_test_..."
            />
            <EnvVar
              varKey="CLERK_SECRET_KEY"
              description="Clerk 대시보드 → API Keys → Secret key — 서버 전용, 절대 NEXT_PUBLIC_ 접두사 금지"
              example="sk_test_..."
            />
            <EnvVar
              varKey="NEXT_PUBLIC_CLERK_SIGN_IN_URL"
              description="로그인 페이지 경로"
              example="=/login"
            />
            <EnvVar
              varKey="NEXT_PUBLIC_CLERK_SIGN_UP_URL"
              description="회원가입 페이지 경로"
              example="=/signup"
            />
            <EnvVar
              varKey="CLERK_WEBHOOK_SIGNING_SECRET"
              description="Clerk 대시보드 → Webhooks → Signing Secret"
              example="whsec_..."
            />
          </div>
        </SubStep>

        <SubStep number={2} title="데이터베이스 변수 — 선택한 DB에 맞게 입력">
          <div className="flex gap-2 mb-3">
            {(["supabase", "neon"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab === "supabase" ? "Supabase" : "Neon"}
              </button>
            ))}
          </div>
          {activeTab === "supabase" ? (
            <div className="space-y-2">
              <EnvVar
                varKey="DB_PROVIDER"
                description="supabase (기본값 — 생략 가능)"
                example="=supabase"
              />
              <EnvVar
                varKey="DATABASE_URL"
                description="Supabase → Project Settings → Database → Connection string → Transaction mode (포트 6543)"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <EnvVar varKey="DB_PROVIDER" description="neon으로 반드시 지정" example="=neon" />
              <EnvVar
                varKey="NEON_DATABASE_URL"
                description="Neon → Connection Details → Pooled connection 문자열 (sslmode=require 포함)"
              />
            </div>
          )}
        </SubStep>

        <SubStep number={3} title=".env.local 전체 예시 (복사 후 실제 값으로 교체)">
          <CodeBlock code={activeTab === "supabase" ? FULL_ENV_SUPABASE : FULL_ENV_NEON} />
          <InfoBox type="warning">
            ⚠️ <code className="font-mono">CLERK_SECRET_KEY</code>,{" "}
            <code className="font-mono">DATABASE_URL</code>,{" "}
            <code className="font-mono">NEON_DATABASE_URL</code>은 서버 전용 변수입니다.{" "}
            <code className="font-mono">NEXT_PUBLIC_</code> 접두사를 절대 붙이지 마세요.
          </InfoBox>
        </SubStep>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 5: 개발 서버 실행
// ─────────────────────────────────────────────

function Step5DevServer() {
  return (
    <div id="step-5" className="scroll-mt-6 space-y-6 rounded-xl border border-slate-700 bg-slate-900/60 p-6">
      <StepHeader
        step={5}
        title="개발 서버 실행"
        description=".env.local 파일이 준비됐으면 개발 서버를 시작합니다."
        icon={<Zap className="h-5 w-5" />}
      />
      <div className="ml-14 space-y-5">
        <SubStep number={1} title="개발 서버 시작">
          <CodeBlock code="npm run dev" />
          <p className="text-xs text-slate-400">
            브라우저에서{" "}
            <code className="text-indigo-300">http://localhost:3000</code> 접속
          </p>
        </SubStep>

        <SubStep number={2} title="정상 동작 확인">
          <ul className="space-y-1 text-xs text-slate-400">
            {[
              "홈 페이지 정상 로딩",
              "/signup 에서 회원가입 시도",
              "/login 에서 로그인 후 /dashboard 이동 확인",
              "콘솔에 DB 오류 없음 → 데이터베이스 연결 성공",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </SubStep>

        <InfoBox type="info">
          💡 콘솔에 <code className="font-mono">DB 오류</code>가 없으면 연결 성공입니다.
          오류가 있다면 <strong>STEP 4</strong>의 연결 문자열을 다시 확인하세요.
        </InfoBox>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 6: Webhook 로컬 테스트
// ─────────────────────────────────────────────

function Step6Webhook() {
  return (
    <div id="step-6" className="scroll-mt-6 space-y-6 rounded-xl border border-slate-700 bg-slate-900/60 p-6">
      <StepHeader
        step={6}
        title="Webhook 로컬 테스트"
        description="회원가입 시 Clerk 이벤트가 DB에 자동 동기화되는지 확인합니다."
        icon={<GitBranch className="h-5 w-5" />}
      />
      <div className="ml-14 space-y-5">
        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
          <p className="mb-3 text-xs font-semibold text-slate-300">동작 흐름</p>
          <div className="space-y-1 text-xs text-slate-400">
            {[
              "회원가입 (/signup)",
              "Clerk → POST /api/webhooks/clerk",
              "서명 검증 (CLERK_WEBHOOK_SIGNING_SECRET)",
              "upsertUser() → DB sn_users 테이블 반영",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="w-4 font-mono text-indigo-400">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <SubStep number={1} title="ngrok으로 로컬 터널 생성">
          <CodeBlock code="ngrok http 3000" />
          <p className="text-xs text-slate-400">
            출력된 <code>https://xxxx.ngrok.io</code> URL을 복사합니다.
          </p>
        </SubStep>

        <SubStep number={2} title="Clerk Webhook URL 업데이트">
          <p className="text-xs text-slate-400">
            Clerk 대시보드 → Webhooks → 등록한 엔드포인트 → URL을 아래로 변경:
          </p>
          <CodeBlock code="https://<ngrok-id>.ngrok.io/api/webhooks/clerk" />
        </SubStep>

        <SubStep number={3} title="회원가입 후 DB 확인">
          <p className="text-xs text-slate-400">
            <code>/signup</code>에서 신규 가입 → DB <code>sn_users</code> 테이블에 row 생성 확인
          </p>
          <div className="mt-2 space-y-2">
            <p className="text-xs text-slate-500">SQL Editor에서 확인:</p>
            <CodeBlock
              code={
                "SELECT clerk_id, email, first_name, created_at\nFROM sn_users\nORDER BY created_at DESC\nLIMIT 10;"
              }
            />
          </div>
          <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <p className="text-xs font-semibold text-slate-300 mb-2">Webhook 응답 상태 확인</p>
            <div className="space-y-1 text-xs text-slate-400">
              {[
                { status: "200 OK", cause: "성공", fix: "—" },
                {
                  status: "400",
                  cause: "CLERK_WEBHOOK_SIGNING_SECRET 불일치",
                  fix: "환경변수 값 재확인",
                },
                {
                  status: "500",
                  cause: "DB 연결 오류",
                  fix: "DATABASE_URL / NEON_DATABASE_URL 재확인",
                },
              ].map((row) => (
                <div key={row.status} className="flex flex-wrap gap-2">
                  <code
                    className={
                      row.status === "200 OK" ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {row.status}
                  </code>
                  <span className="text-slate-500">·</span>
                  <span>{row.cause}</span>
                  {row.fix !== "—" && (
                    <>
                      <span className="text-slate-500">→</span>
                      <span className="text-amber-300">{row.fix}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </SubStep>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 참고: 프로젝트 구조 & 백엔드 블록
// ─────────────────────────────────────────────

const directoryItems = [
  { path: "src/app/", title: "앱 라우터", description: "Next.js App Router 진입점, 레이아웃, 페이지" },
  { path: "src/app/api/[[...hono]]/", title: "Hono 진입점", description: "Next.js Route Handler에서 Hono 앱을 위임" },
  { path: "src/backend/hono/", title: "Hono 앱 본체", description: "app.ts (싱글턴) · context.ts (AppEnv 타입)" },
  { path: "src/backend/db/", title: "DB 추상화", description: "Drizzle ORM 싱글턴 · DB_PROVIDER 분기 · 스키마" },
  { path: "src/backend/middleware/", title: "공통 미들웨어", description: "에러 바운더리 · 앱 컨텍스트 주입" },
  { path: "src/features/[feature]/", title: "기능 모듈", description: "backend/(route · service · schema) + components/ + hooks/" },
  { path: "src/app/api/webhooks/clerk/", title: "Clerk Webhook", description: "사용자 이벤트 수신 → sn_users 동기화" },
  { path: "supabase/migrations/", title: "Supabase 마이그레이션", description: "SQL 파일로 스키마 관리 (0001, 0002 순서 실행)" },
  { path: "neon/migrations/", title: "Neon 마이그레이션", description: "Neon용 통합 초기 스키마 SQL (0001 단일 파일)" },
];

function ArchitectureSection() {
  return (
    <div id="architecture" className="scroll-mt-6 grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/60 p-6">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-300" />
          <h2 className="text-lg font-semibold text-slate-100">프로젝트 구조</h2>
        </div>
        <ul className="space-y-2">
          {directoryItems.map((item) => (
            <li
              key={item.path}
              className="rounded-lg border border-slate-800 bg-slate-950/50 p-3"
            >
              <code className="text-xs font-semibold text-amber-300">{item.path}</code>
              <p className="mt-0.5 text-xs text-slate-300">{item.description}</p>
              <p className="text-xs text-slate-500">{item.title}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/60 p-6">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-indigo-300" />
          <h2 className="text-lg font-semibold text-slate-100">백엔드 빌딩 블록</h2>
        </div>
        <ul className="space-y-3">
          {[
            {
              title: "Hono 앱 구성",
              description:
                "errorBoundary → withAppContext → 기능별 라우터 등록 순서로 조립합니다.",
              icon: <Server className="w-4 h-4" />,
            },
            {
              title: "Drizzle ORM",
              description:
                "DB_PROVIDER에 따라 Supabase 또는 Neon에 연결하는 db 싱글턴을 직접 import해 사용합니다.",
              icon: <Database className="w-4 h-4" />,
            },
            {
              title: "React Query 연동",
              description:
                "모든 클라이언트 데이터 패칭은 React Query 훅을 통해 수행하며 Zod 스키마로 응답을 검증합니다.",
              icon: <Boxes className="w-4 h-4" />,
            },
            {
              title: "Clerk 미들웨어",
              description:
                "clerkMiddleware + createRouteMatcher로 보호 경로를 선언하고, auth.protect()로 미인증 시 자동 리다이렉트합니다.",
              icon: <Shield className="w-4 h-4" />,
            },
          ].map((item) => (
            <li
              key={item.title}
              className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3"
            >
              <div className="mt-0.5 text-indigo-300">{item.icon}</div>
              <div>
                <p className="text-sm font-medium text-slate-100">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
          <p className="mb-2 text-xs font-semibold text-slate-300">새 기능 추가 패턴</p>
          <div className="space-y-1 text-xs text-slate-400">
            {[
              "src/features/[feature]/backend/schema.ts — Zod 요청/응답 스키마",
              "src/features/[feature]/backend/service.ts — Drizzle DB 로직",
              "src/features/[feature]/backend/route.ts — Hono 라우터",
              "src/features/[feature]/hooks/ — React Query 훅",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-indigo-400">›</span>
                <code>{item}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 참고: 개발 도구 & Vercel 배포
// ─────────────────────────────────────────────

function DevToolsSection() {
  return (
    <div id="devtools" className="scroll-mt-6 rounded-xl border border-slate-700 bg-slate-900/60 p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-indigo-300" />
        <h2 className="text-lg font-semibold text-slate-100">개발 도구 & 배포</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-200">주요 npm 스크립트</p>
          <div className="space-y-2">
            {[
              { cmd: "npm install", desc: "패키지 설치" },
              { cmd: "npm run dev", desc: "개발 서버 실행" },
              { cmd: "npm run build", desc: "프로덕션 빌드" },
              { cmd: "npm run lint", desc: "ESLint 정적 점검" },
              { cmd: "npx drizzle-kit studio", desc: "DB 시각화 (Drizzle Studio)" },
            ].map(({ cmd, desc }) => (
              <div
                key={cmd}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2"
              >
                <code className="text-xs text-slate-300">{cmd}</code>
                <span className="text-xs text-slate-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-200">Vercel 배포 체크리스트</p>
          <ul className="space-y-2 text-xs text-slate-400">
            {[
              "Vercel 프로젝트 → Settings → Environment Variables에 .env.local 변수 추가",
              "DB_PROVIDER 값 설정 (supabase 또는 neon)",
              "CLERK_WEBHOOK_SIGNING_SECRET 추가",
              "Clerk 대시보드 Webhook URL을 Vercel 배포 URL로 업데이트",
              "환경변수 추가 후 Redeploy 실행",
              "배포 후 /signup 회원가입 → DB sn_users 확인",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-slate-600">□</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "#step-1", label: "1. 설치" },
  { href: "#step-2", label: "2. 인증" },
  { href: "#step-3", label: "3. DB" },
  { href: "#step-4", label: "4. 환경변수" },
  { href: "#step-5", label: "5. 실행" },
  { href: "#step-6", label: "6. Webhook" },
  { href: "#architecture", label: "참고" },
];

export default function Home() {
  const { isAuthenticated, isLoading } = useCurrentUser();

  const authActions = useMemo(() => {
    if (isLoading) {
      return <span className="text-sm text-slate-300">세션 확인 중...</span>;
    }
    if (isAuthenticated) {
      return (
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-md border border-slate-600 px-3 py-1 text-sm text-slate-200 transition hover:border-slate-400 hover:bg-slate-800"
          >
            대시보드
          </Link>
          <UserAvatarButton />
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/login"
          className="rounded-md border border-slate-600 px-3 py-1 text-slate-200 transition hover:border-slate-400 hover:bg-slate-800"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-slate-100 px-3 py-1 text-slate-900 transition hover:bg-white"
        >
          회원가입
        </Link>
      </div>
    );
  }, [isAuthenticated, isLoading]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* 상단 네비게이션 바 */}
      <div className="border-b border-slate-800 bg-slate-950/90 px-6 py-4">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div className="text-sm font-medium text-slate-300">
            SuperNext — Next.js · Clerk · Supabase / Neon · Drizzle ORM
          </div>
          {authActions}
        </div>
      </div>

      {/* 섹션 빠른 이동 */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl overflow-x-auto px-6 py-2.5 gap-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        {/* Hero */}
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            SuperNext 설정 가이드
          </h1>
          <p className="max-w-3xl text-base text-slate-300 md:text-lg">
            아래 6단계를 순서대로 따라하면 로컬 개발 환경을 완성할 수 있습니다.
            <br />
            <span className="text-sm text-slate-400">
              Next.js App Router · Clerk 인증 · Supabase 또는 Neon DB · Drizzle ORM · Hono.js · React
              Query
            </span>
          </p>
          {/* 단계 미리보기 */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              "1. 설치",
              "2. Clerk 설정",
              "3. DB 선택",
              "4. 환경변수",
              "5. 서버 실행",
              "6. Webhook 테스트",
            ].map((label, i, arr) => (
              <div key={label} className="flex items-center gap-2">
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                  {label}
                </span>
                {i < arr.length - 1 && (
                  <span className="text-slate-600 text-xs">›</span>
                )}
              </div>
            ))}
          </div>
        </header>

        {/* Steps */}
        <Step1Install />
        <Step2Clerk />
        <Step3Database />
        <Step4EnvVars />
        <Step5DevServer />
        <Step6Webhook />

        {/* 참고 섹션 */}
        <div className="pt-4 border-t border-slate-800">
          <h2 className="mb-6 text-lg font-semibold text-slate-300">참고 — 아키텍처 & 개발 도구</h2>
          <div className="flex flex-col gap-6">
            <ArchitectureSection />
            <DevToolsSection />
          </div>
        </div>
      </div>
    </main>
  );
}
