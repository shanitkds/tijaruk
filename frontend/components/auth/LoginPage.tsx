"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, X } from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { loginApi } from "../../api/axios";
import { setAuthSession, type AuthSession } from "../../lib/auth";

const FIGMA_LOGIN_IMAGE = "/login-background.jpg";

type VerificationResponse = {
  verification_required: true;
  verification_token: string;
  email: string;
  expires_at: string;
  resend_available_at: string;
};

function getApiError(caughtError: unknown, fallback: string) {
  if (!caughtError || typeof caughtError !== "object" || !("response" in caughtError)) {
    return caughtError instanceof Error ? caughtError.message : fallback;
  }

  const data = (
    caughtError as {
      response?: {
        data?: {
          non_field_errors?: string[];
          detail?: string;
          error?: string;
        };
      };
    }
  ).response?.data;

  return Array.isArray(data?.non_field_errors)
    ? data.non_field_errors[0]
    : data?.detail || data?.error || fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (!verification) {
      return;
    }
    const updateCountdown = () => {
      const remaining = Math.ceil(
        (new Date(verification.resend_available_at).getTime() - Date.now()) / 1000,
      );
      setResendSeconds(Math.max(0, remaining));
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [verification]);

  useEffect(() => {
    if (!error) return;

    const timer = window.setTimeout(() => setError(""), 5000);
    return () => window.clearTimeout(timer);
  }, [error]);

  function completeLogin(data: AuthSession, remember = true) {
    setAuthSession(data, remember);
    if (data.user?.role === "BUSINESS") {
      if (data.user?.role_type === "GUEST") {
        router.replace("/");
        return;
      }
      router.replace("/user");
      return;
    }
    if (
      data.user?.role === "ADMIN" ||
      data.user?.role === "INTERNAL_STAFF"
    ) {
      router.replace("/admin");
      return;
    }
    throw new Error("This account does not have dashboard access.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isGoogleSubmitting || isVerifying || isResending) {
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await loginApi.post<AuthSession | VerificationResponse>("/accounts/login/", {
        email,
        password,
      });

      if ("verification_required" in data) {
        setVerification(data);
        setOtp("");
      } else {
        completeLogin(data, rememberMe);
      }
    } catch (caughtError) {
      setError(getApiError(caughtError, "Unable to connect to the login service."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSuccess(response: CredentialResponse) {
    if (!response.credential) {
      setError("Google did not return a valid credential.");
      return;
    }

    setError("");
    setIsGoogleSubmitting(true);
    try {
      const result = await loginApi.post<AuthSession | VerificationResponse>(
        "/accounts/google/",
        {
          credential: response.credential,
        },
      );
      if ("verification_required" in result.data) {
        setVerification(result.data);
        setOtp("");
      } else {
        completeLogin(result.data);
      }
    } catch (caughtError) {
      setError(getApiError(caughtError, "Unable to sign in with Google."));
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verification) {
      return;
    }
    setError("");
    setIsVerifying(true);
    try {
      const { data } = await loginApi.post<AuthSession>("/accounts/verify-otp/", {
        verification_token: verification.verification_token,
        otp,
      });
      completeLogin(data, rememberMe);
    } catch (caughtError) {
      setError(getApiError(caughtError, "Unable to verify this code."));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendOtp() {
    if (!verification || resendSeconds > 0) {
      return;
    }
    setError("");
    setIsResending(true);
    try {
      const { data } = await loginApi.post<VerificationResponse>(
        "/accounts/resend-otp/",
        { verification_token: verification.verification_token },
      );
      setVerification({ ...verification, ...data });
      setOtp("");
    } catch (caughtError) {
      setError(getApiError(caughtError, "Unable to resend the code."));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className="h-[100dvh] w-screen overflow-hidden bg-white font-['Poppins',sans-serif] text-[#111827] lg:grid lg:grid-cols-2">
      {error ? (
        <div
          className="fixed right-4 top-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 shadow-[0_16px_45px_rgba(31,17,35,0.18)] sm:right-6 sm:top-6"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-red-900">Unable to sign in</p>
            <p className="mt-0.5 text-xs leading-5 text-[#6b7280]">{error}</p>
          </div>
          <button
            aria-label="Close error notification"
            className="shrink-0 rounded-md p-1 text-[#9ca3af] transition hover:bg-red-50 hover:text-red-700"
            onClick={() => setError("")}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      ) : null}

      <section className="relative hidden h-full overflow-hidden bg-[#5f0c66] lg:flex lg:items-center lg:justify-center">
        <img
          alt=""
          className="absolute inset-0 size-full object-cover opacity-35 mix-blend-luminosity"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/home-images/hero-image.webp";
          }}
          src={FIGMA_LOGIN_IMAGE}
        />
        <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(95,12,102,0.92),rgba(88,28,135,0.82),rgba(95,12,102,0.9))]" />
        <span className="absolute -left-48 -top-48 size-96 rounded-full bg-[#e39b4d]/10" />
        <span className="absolute -bottom-48 -right-48 size-96 rounded-full bg-[#a855f7]/10" />
        <Link className="relative z-10 block h-[130px] w-[268px]" href="/">
          <img alt="Tijaruk" className="size-full object-contain" src="/tijaruk-logo.svg" />
        </Link>
      </section>

      <section className="relative flex h-full items-center justify-center overflow-hidden px-5 py-4 sm:px-8 lg:px-16">
        <Link className="absolute left-5 top-4 h-12 w-28 rounded-lg bg-[#5f0c66] px-3 lg:hidden" href="/">
          <img alt="Tijaruk" className="size-full object-contain" src="/tijaruk-logo.svg" />
        </Link>

        <div className="w-full max-w-[448px] pt-12 lg:pt-0">
          <header>
            <h1 className="text-[28px] font-bold leading-8 tracking-[-0.5px]">Welcome Back</h1>
            <p className="mt-1 text-sm leading-5 tracking-[-0.5px] text-[#4b5563]">
              Sign in to access your account
            </p>
          </header>

          {!verification ? <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#374151]">Email Address</span>
              <span className="relative block">
                <Mail
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]"
                />
                <input
                  autoComplete="email"
                  autoFocus
                  className="h-12 w-full rounded-xl border border-[#d1d5db] bg-white pl-12 pr-4 text-sm text-black outline-none transition placeholder:text-black focus:border-[#5f0c66] focus:ring-2 focus:ring-[#5f0c66]/15"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  required
                  type="email"
                  value={email}
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#374151]">Password</span>
              <span className="relative block">
                <LockKeyhole
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]"
                />
                <input
                  autoComplete="current-password"
                  className="h-12 w-full rounded-xl border border-[#d1d5db] bg-white px-12 text-sm text-black outline-none transition placeholder:text-black focus:border-[#5f0c66] focus:ring-2 focus:ring-[#5f0c66]/15"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition hover:text-[#5f0c66]"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              </span>
            </label>

            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-[#4b5563]">
                <input
                  checked={rememberMe}
                  className="size-4 accent-[#5f0c66]"
                  onChange={(event) => setRememberMe(event.target.checked)}
                  type="checkbox"
                />
                Remember me
              </label>
              <Link className="font-semibold text-[#e39b4d]" href="/forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#5f0c66] text-sm font-semibold text-white shadow-[0_5px_8px_rgba(95,12,102,0.48)] transition hover:bg-[#500957] disabled:cursor-not-allowed disabled:opacity-65"
              disabled={
                isSubmitting || isGoogleSubmitting || isVerifying || isResending
              }
              type="submit"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>

            <p className="flex items-center justify-center gap-2 text-xs text-[#6b7280]">
              <ShieldCheck aria-hidden="true" className="size-3" />
              Your data is securely protected
            </p>
          </form> : null}

          <div className="mt-5">
            {!verification ? <div className="flex items-center gap-4 text-sm text-[#6b7280]">
              <span className="h-px flex-1 bg-[#d1d5db]" />
              Or continue with
              <span className="h-px flex-1 bg-[#d1d5db]" />
            </div> : null}
            {verification ? (
              <form className="mt-4 space-y-3" onSubmit={handleVerifyOtp}>
                <p className="text-sm text-[#4b5563]">
                  Enter the six-digit code sent to{" "}
                  <strong>{verification.email}</strong>.
                </p>
                <input
                  aria-label="Verification code"
                  autoComplete="one-time-code"
                  className="h-12 w-full rounded-xl border border-[#d1d5db] px-4 text-center text-lg tracking-[0.35em] text-black outline-none focus:border-[#5f0c66] focus:ring-2 focus:ring-[#5f0c66]/15"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                  pattern="\d{6}"
                  placeholder="000000"
                  required
                  value={otp}
                />
                <button
                  className="h-12 w-full rounded-xl bg-[#5f0c66] text-sm font-semibold text-white disabled:opacity-60"
                  disabled={isVerifying || otp.length !== 6}
                  type="submit"
                >
                  {isVerifying ? "Verifying..." : "Verify and Sign In"}
                </button>
                <button
                  className="w-full text-sm font-semibold text-[#e39b4d] disabled:text-[#9ca3af]"
                  disabled={isResending || resendSeconds > 0}
                  onClick={handleResendOtp}
                  type="button"
                >
                  {isResending
                    ? "Sending..."
                    : resendSeconds > 0
                      ? `Resend code in ${resendSeconds}s`
                      : "Resend code"}
                </button>
              </form>
            ) : (
              <div className="mt-4 space-y-3">
                <div className={isGoogleSubmitting ? "pointer-events-none flex justify-center opacity-50" : "flex justify-center"}>
                  <GoogleLogin
                    onError={() => setError("Google Sign-In was unsuccessful.")}
                    onSuccess={handleGoogleSuccess}
                    shape="rectangular"
                    size="large"
                    text="continue_with"
                    theme="outline"
                    width="448"
                  />
                </div>
                {isGoogleSubmitting ? (
                  <p className="text-center text-sm text-[#6b7280]" role="status">
                    Signing in with Google...
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <div className="mt-5 text-center text-sm text-[#4b5563]">
            <p>Don&apos;t have an account?</p>
            <Link className="font-semibold text-[#e39b4d]" href="/signup">
              Create New Account
            </Link>
          </div>

          <footer className="mt-5 border-t border-[#e5e7eb] pt-5 text-center text-xs text-[#6b7280]">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              <button type="button">Privacy Policy</button>
              <span className="text-[#d1d5db]">•</span>
              <button type="button">Terms of Service</button>
              <span className="text-[#d1d5db]">•</span>
              <Link href="/contact">Contact Support</Link>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
