"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

type Step = "password" | "mfa";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useCurrentUser();
  const { signIn, fetchStatus } = useSignIn();
  const [step, setStep] = useState<Step>("password");
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [mfaCode, setMfaCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectedFrom =
        searchParams.get("redirect_url") ??
        searchParams.get("redirectedFrom") ??
        "/";
      router.replace(redirectedFrom);
    }
  }, [isAuthenticated, router, searchParams]);

  const getRedirectUrl = useCallback(
    (decorateUrl: (url: string) => string) => {
      const redirectedFrom =
        searchParams.get("redirect_url") ??
        searchParams.get("redirectedFrom") ??
        "/";
      return decorateUrl(redirectedFrom);
    },
    [searchParams]
  );

  const finalizeSignIn = useCallback(
    async (decorateUrl: (url: string) => string) => {
      const url = getRedirectUrl(decorateUrl);
      if (url.startsWith("http")) {
        window.location.href = url;
      } else {
        router.replace(url);
      }
    },
    [getRedirectUrl, router]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setFormState((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handlePasswordSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMessage(null);

      const { error } = await signIn.password({
        identifier: formState.email,
        password: formState.password,
      });

      if (error) {
        setErrorMessage(error.message ?? "로그인에 실패했습니다.");
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({ navigate: ({ decorateUrl }) => finalizeSignIn(decorateUrl) });
        return;
      }

      if (signIn.status === "needs_second_factor") {
        await signIn.mfa.sendEmailCode();
        setInfoMessage("이메일로 인증 코드를 전송했습니다.");
        setStep("mfa");
      }
    },
    [formState.email, formState.password, signIn, finalizeSignIn]
  );

  const handleMfaSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMessage(null);

      const { error } = await signIn.mfa.verifyEmailCode({ code: mfaCode });

      if (error) {
        setErrorMessage(error.message ?? "인증에 실패했습니다.");
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({ navigate: ({ decorateUrl }) => finalizeSignIn(decorateUrl) });
      }
    },
    [signIn, mfaCode, finalizeSignIn]
  );

  const handleResendMfa = useCallback(async () => {
    setErrorMessage(null);
    await signIn.mfa.sendEmailCode();
    setInfoMessage("인증 코드를 재전송했습니다.");
  }, [signIn]);

  if (isAuthenticated) {
    return null;
  }

  const isSubmitting = fetchStatus === "fetching";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">로그인</h1>
        <p className="text-slate-500">
          {step === "mfa"
            ? "이메일로 전송된 인증 코드를 입력하세요."
            : "계정으로 로그인하고 보호된 페이지에 접근하세요."}
        </p>
      </header>
      <div className="grid w-full gap-8 md:grid-cols-2">
        {step === "mfa" ? (
          <form
            onSubmit={handleMfaSubmit}
            className="flex flex-col gap-4 rounded-xl border border-slate-200 p-6 shadow-sm"
          >
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              인증 코드
              <input
                type="text"
                name="code"
                autoComplete="one-time-code"
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="6자리 코드 입력"
                className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
              />
            </label>
            {errorMessage ? (
              <p className="text-sm text-rose-500">{errorMessage}</p>
            ) : null}
            {infoMessage ? (
              <p className="text-sm text-emerald-600">{infoMessage}</p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "확인 중" : "인증 완료"}
            </button>
            <button
              type="button"
              onClick={handleResendMfa}
              disabled={isSubmitting}
              className="text-xs text-slate-500 underline hover:text-slate-700"
            >
              코드 재전송
            </button>
            <button
              type="button"
              onClick={() => { setStep("password"); setErrorMessage(null); setInfoMessage(null); }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              비밀번호 입력으로 돌아가기
            </button>
          </form>
        ) : (
          <form
            onSubmit={handlePasswordSubmit}
            className="flex flex-col gap-4 rounded-xl border border-slate-200 p-6 shadow-sm"
          >
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              이메일
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={formState.email}
                onChange={handleChange}
                className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              비밀번호
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={formState.password}
                onChange={handleChange}
                className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
              />
            </label>
            {errorMessage ? (
              <p className="text-sm text-rose-500">{errorMessage}</p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "로그인 중" : "로그인"}
            </button>
            <p className="text-xs text-slate-500">
              계정이 없으신가요?{" "}
              <Link
                href="/signup"
                className="font-medium text-slate-700 underline hover:text-slate-900"
              >
                회원가입
              </Link>
            </p>
          </form>
        )}
        <figure className="overflow-hidden rounded-xl border border-slate-200">
          <Image
            src="https://picsum.photos/seed/login/640/640"
            alt="로그인"
            width={640}
            height={640}
            className="h-full w-full object-cover"
            priority
          />
        </figure>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
