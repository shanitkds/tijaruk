"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { loginApi } from "../../api/axios";

function getApiError(caughtError: unknown, fallback: string) {
  if (!caughtError || typeof caughtError !== "object" || !("response" in caughtError)) {
    return caughtError instanceof Error ? caughtError.message : fallback;
  }

  const data = (
    caughtError as {
      response?: {
        data?: {
          detail?: string;
          error?: string;
          password?: string[];
          confirm_password?: string[];
          token?: string[];
        };
      };
    }
  ).response?.data;

  return (
    data?.password?.[0] ||
    data?.confirm_password?.[0] ||
    data?.token?.[0] ||
    data?.detail ||
    data?.error ||
    fallback
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(token ? "" : "This password reset link is missing a token.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("This password reset link is missing a token.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await loginApi.post<{ detail: string }>(
        "/accounts/password-reset/confirm/",
        {
          token,
          password,
          confirm_password: confirmPassword,
        },
      );
      setMessage(data.detail || "Your password has been reset. You can sign in now.");
      window.setTimeout(() => router.replace("/login"), 1400);
    } catch (caughtError) {
      setError(getApiError(caughtError, "Unable to reset this password."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <PasswordInput
        label="New Password"
        onChange={setPassword}
        onToggle={() => setShowPassword((current) => !current)}
        placeholder="Create a new password"
        show={showPassword}
        value={password}
      />
      <PasswordInput
        label="Confirm Password"
        onChange={setConfirmPassword}
        onToggle={() => setShowConfirmPassword((current) => !current)}
        placeholder="Confirm your new password"
        show={showConfirmPassword}
        value={confirmPassword}
      />

      {message ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#5f0c66] text-sm font-semibold text-white shadow-[0_5px_8px_rgba(95,12,102,0.35)] transition hover:bg-[#500957] disabled:cursor-not-allowed disabled:opacity-65"
        disabled={isSubmitting || !token}
        type="submit"
      >
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

function PasswordInput({
  label,
  onChange,
  onToggle,
  placeholder,
  show,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  onToggle: () => void;
  placeholder: string;
  show: boolean;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#374151]">{label}</span>
      <span className="relative block">
        <LockKeyhole
          aria-hidden="true"
          className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]"
        />
        <input
          autoComplete="new-password"
          className="h-12 w-full rounded-xl border border-[#d1d5db] bg-white px-12 text-sm text-black outline-none transition placeholder:text-black focus:border-[#5f0c66] focus:ring-2 focus:ring-[#5f0c66]/15"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          type={show ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition hover:text-[#5f0c66]"
          onClick={onToggle}
          type="button"
        >
          {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </span>
    </label>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-white px-5 py-8 font-['Poppins',sans-serif] text-[#111827]">
      <section className="w-full max-w-[448px]">
        <Link className="mb-8 block h-12 w-28 rounded-lg bg-[#5f0c66] px-3" href="/">
          <img alt="Tijaruk" className="size-full object-contain" src="/tijaruk-logo.svg" />
        </Link>

        <header>
          <h1 className="text-[28px] font-bold leading-8">Reset Password</h1>
          <p className="mt-2 text-sm leading-5 text-[#4b5563]">
            Enter a new password for your account.
          </p>
        </header>

        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-5 text-center text-sm">
          <Link className="font-semibold text-[#e39b4d]" href="/login">
            Back to Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}
