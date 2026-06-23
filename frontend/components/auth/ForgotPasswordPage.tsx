"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
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
          email?: string[];
        };
      };
    }
  ).response?.data;

  return data?.email?.[0] || data?.detail || data?.error || fallback;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const { data } = await loginApi.post<{ detail: string }>(
        "/accounts/password-reset/request/",
        { email },
      );
      setMessage(data.detail || "If an account exists, we sent a reset link.");
    } catch (caughtError) {
      setError(getApiError(caughtError, "Unable to send the reset email."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-white px-5 py-8 font-['Poppins',sans-serif] text-[#111827]">
      <section className="w-full max-w-[448px]">
        <Link className="mb-8 block h-12 w-28 rounded-lg bg-[#5f0c66] px-3" href="/">
          <img alt="Tijaruk" className="size-full object-contain" src="/tijaruk-logo.svg" />
        </Link>

        <header>
          <h1 className="text-[28px] font-bold leading-8">Forgot Password</h1>
          <p className="mt-2 text-sm leading-5 text-[#4b5563]">
            Enter your email and we will send a password reset link.
          </p>
        </header>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm">
          <Link className="font-semibold text-[#e39b4d]" href="/login">
            Back to Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}
