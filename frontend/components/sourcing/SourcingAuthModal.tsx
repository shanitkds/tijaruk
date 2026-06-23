// @ts-nocheck
"use client";

import { FormEvent, useEffect, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { X } from "lucide-react";
import { loginApi } from "../../api/axios";
import { setAuthSession, type AuthSession } from "../../lib/auth";

type VerificationResponse = {
  verification_required: true;
  verification_token: string;
  email: string;
  expires_at: string;
  resend_available_at: string;
};

type SourcingAuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export default function SourcingAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: SourcingAuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError("");
      setPassword("");
      setVerification(null);
      setOtp("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function completeLogin(data: AuthSession) {
    setAuthSession(data, true);
    onSuccess();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isGoogleSubmitting || isVerifying) {
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
        completeLogin(data);
      }
    } catch (caughtError) {
      setError(getApiError(caughtError, "Unable to sign in. Please check your details."));
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
        { credential: response.credential },
      );
      if ("verification_required" in result.data) {
        setVerification(result.data);
        setOtp("");
      } else {
        completeLogin(result.data);
      }
    } catch (caughtError) {
      setError(getApiError(caughtError, "Unable to continue with Google."));
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
      completeLogin(data);
    } catch (caughtError) {
      setError(getApiError(caughtError, "Unable to verify this code."));
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 px-4 py-6 font-['Poppins',sans-serif]">
      <div className="relative w-full max-w-[480px] rounded-[18px] bg-white px-7 py-8 shadow-[0_28px_90px_rgba(17,24,39,0.35)]">
        <button
          aria-label="Close sign in"
          className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full text-[#8b93a1] transition hover:bg-[#f4eef5] hover:text-[#5f0c66]"
          onClick={onClose}
          type="button"
        >
          <X className="size-5" />
        </button>

        <h2 className="pr-8 text-2xl font-bold text-[#5f0c66]">Sign in to send RFQ</h2>
        <p className="mt-2 text-sm leading-5 text-[#64748b]">
          Access your Tijaruk account to submit this sourcing request.
        </p>

        {verification ? (
          <form className="mt-6 space-y-4" onSubmit={handleVerifyOtp}>
            <p className="text-sm text-[#475569]">
              Enter the six-digit code sent to <strong>{verification.email}</strong>.
            </p>
            <input
              autoComplete="one-time-code"
              className="h-12 w-full rounded-[10px] border border-[#d9e1ef] bg-[#edf4ff] px-4 text-center text-lg tracking-[0.35em] text-[#111827] outline-none focus:border-[#5f0c66]"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
              value={otp}
            />
            <button
              className="h-12 w-full rounded-[9px] bg-[#5f0c66] text-base font-bold text-white transition hover:bg-[#500957] disabled:opacity-60"
              disabled={isVerifying || otp.length !== 6}
              type="submit"
            >
              {isVerifying ? "Verifying..." : "Verify and Send RFQ"}
            </button>
          </form>
        ) : (
          <>
            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-base font-medium text-[#334155]">Email</span>
                <input
                  autoComplete="email"
                  className="h-[52px] w-full rounded-[10px] border border-[#d9e1ef] bg-[#edf4ff] px-5 text-base text-[#111827] outline-none focus:border-[#5f0c66]"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-base font-medium text-[#334155]">Password</span>
                <input
                  autoComplete="current-password"
                  className="h-[52px] w-full rounded-[10px] border border-[#d9e1ef] bg-[#edf4ff] px-5 text-base text-[#111827] outline-none focus:border-[#5f0c66]"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>

              <button
                className="h-[56px] w-full rounded-[9px] bg-[#5f0c66] text-base font-bold text-white transition hover:bg-[#500957] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting || isGoogleSubmitting}
                type="submit"
              >
                {isSubmitting ? "Signing in..." : "Sign In & Send RFQ"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4 text-sm text-[#9aa3b2]">
              <span className="h-px flex-1 bg-[#e2e8f0]" />
              or
              <span className="h-px flex-1 bg-[#e2e8f0]" />
            </div>

            <div className={isGoogleSubmitting ? "pointer-events-none flex justify-center opacity-55" : "flex justify-center"}>
              <GoogleLogin
                onError={() => setError("Google Sign-In was unsuccessful.")}
                onSuccess={handleGoogleSuccess}
                shape="rectangular"
                size="large"
                text="continue_with"
                theme="outline"
                width="420"
              />
            </div>
            <p className="mt-5 text-center text-sm text-[#9aa3b2]">
              Your RFQ details will be submitted after sign in.
            </p>
          </>
        )}

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
