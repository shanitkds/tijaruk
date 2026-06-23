"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserRound,
} from "lucide-react";
import { loginApi } from "../../api/axios";

type SignupForm = {
  name: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

type VerificationResponse = {
  verification_required: true;
  verification_token: string;
  email: string;
  expires_at: string;
  resend_available_at: string;
};

const initialForm: SignupForm = {
  name: "",
  email: "",
  username: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

function getApiError(caughtError: unknown) {
  if (!caughtError || typeof caughtError !== "object" || !("response" in caughtError)) {
    return caughtError instanceof Error
      ? caughtError.message
      : "Unable to create your account.";
  }

  const data = (
    caughtError as {
      response?: { data?: Record<string, string | string[]> };
    }
  ).response?.data;

  if (!data) {
    return "Unable to create your account.";
  }

  const firstError = Object.values(data)[0];
  return Array.isArray(firstError)
    ? firstError[0]
    : typeof firstError === "string"
      ? firstError
      : "Please check your details and try again.";
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (!verification) return;

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

  function updateField<K extends keyof SignupForm>(field: K, value: SignupForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await loginApi.post<VerificationResponse>("/accounts/register/", {
        name: form.name,
        email: form.email,
        username: form.username,
        phone: form.phone,
        password: form.password,
        confirm_password: form.confirmPassword,
        accepted_terms: form.acceptedTerms,
      });
      setVerification(data);
      setOtp("");
    } catch (caughtError) {
      setError(getApiError(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verification) return;

    setError("");
    setIsVerifying(true);
    try {
      await loginApi.post("/accounts/verify-otp/", {
        verification_token: verification.verification_token,
        otp,
      });
      router.replace("/login");
    } catch (caughtError) {
      setError(getApiError(caughtError));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendOtp() {
    if (!verification || resendSeconds > 0) return;

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
      setError(getApiError(caughtError));
    } finally {
      setIsResending(false);
    }
  }

  if (verification) {
    return (
      <main className="min-h-[100dvh] bg-white font-['Poppins',sans-serif] text-[#111827] lg:grid lg:grid-cols-2">
        <SignupBrandPanel />
        <section className="flex min-h-[100dvh] items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-[460px]">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#5f0c66]/10 text-[#5f0c66]">
              <ShieldCheck className="size-8" />
            </div>
            <header className="mt-5 text-center">
              <h1 className="text-[28px] font-bold">Verify Your Email</h1>
              <p className="mt-2 text-sm text-[#4b5563]">
                Enter the six-digit code sent to <strong>{verification.email}</strong>.
              </p>
            </header>
            <form className="mt-6 space-y-4" onSubmit={handleVerifyOtp}>
              <input
                aria-label="Verification code"
                autoComplete="one-time-code"
                autoFocus
                className="h-14 w-full rounded-xl border border-[#d1d5db] px-4 text-center text-xl tracking-[0.4em] outline-none focus:border-[#5f0c66] focus:ring-2 focus:ring-[#5f0c66]/15"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                pattern="\d{6}"
                placeholder="000000"
                required
                value={otp}
              />
              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                className="h-12 w-full rounded-xl bg-[#5f0c66] text-sm font-semibold text-white disabled:opacity-60"
                disabled={isVerifying || otp.length !== 6}
                type="submit"
              >
                {isVerifying ? "Verifying..." : "Verify Account"}
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
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-white font-['Poppins',sans-serif] text-[#111827] lg:grid lg:h-[100dvh] lg:grid-cols-2 lg:overflow-hidden">
      <SignupBrandPanel />

      <section className="relative flex min-h-[100dvh] items-center justify-center px-5 py-8 sm:px-8 lg:min-h-0 lg:overflow-y-auto lg:px-12 lg:py-8">
        <Link className="absolute left-5 top-4 h-12 w-28 rounded-lg bg-[#5f0c66] px-3 lg:hidden" href="/">
          <img alt="Tijaruk" className="size-full object-contain" src="/tijaruk-logo.svg" />
        </Link>

        <div className="w-full max-w-[560px] pt-12 lg:py-0 lg:pt-0">
          <header>
            <h1 className="text-[28px] font-bold leading-8 tracking-[-0.5px]">Create Your Account</h1>
            <p className="mt-1 text-sm text-[#4b5563]">
              Join Tijaruk and start managing your business.
            </p>
          </header>

          <button
            className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#d1d5db] text-sm font-semibold text-[#374151] transition hover:bg-gray-50"
            onClick={() => setError("Google sign-up is not configured yet. Please use the form below.")}
            type="button"
          >
            <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
              <path d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" fill="#4285F4" />
              <path d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" fill="#34A853" />
              <path d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.63.39 3.17 1.04 4.55l3.35-2.62Z" fill="#FBBC05" />
              <path d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-4 text-xs text-[#6b7280]">
            <span className="h-px flex-1 bg-[#d1d5db]" />
            Or sign up with email
            <span className="h-px flex-1 bg-[#d1d5db]" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField icon={UserRound} label="Full Name">
                <input
                  autoComplete="name"
                  className="signup-input"
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Your full name"
                  required
                  value={form.name}
                />
              </FormField>
              <FormField icon={User} label="Username">
                <input
                  autoComplete="username"
                  className="signup-input"
                  onChange={(event) => updateField("username", event.target.value)}
                  placeholder="Choose a username"
                  required
                  value={form.username}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField icon={Mail} label="Email Address">
                <input
                  autoComplete="email"
                  className="signup-input"
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@company.com"
                  required
                  type="email"
                  value={form.email}
                />
              </FormField>

              <FormField icon={Phone} label="Phone Number">
                <input
                  autoComplete="tel"
                  className="signup-input"
                  onChange={(event) => updateField("phone", event.target.value)}
                  pattern="\+?[0-9]{9,15}"
                  placeholder="+966500000000"
                  required
                  type="tel"
                  value={form.phone}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordField
                label="Password"
                onChange={(value) => updateField("password", value)}
                onToggle={() => setShowPassword((current) => !current)}
                placeholder="Create a password"
                show={showPassword}
                value={form.password}
              />
              <PasswordField
                label="Confirm Password"
                onChange={(value) => updateField("confirmPassword", value)}
                onToggle={() => setShowConfirmPassword((current) => !current)}
                placeholder="Confirm password"
                show={showConfirmPassword}
                value={form.confirmPassword}
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-[#4b5563]">
              <input
                checked={form.acceptedTerms}
                className="mt-0.5 size-4 shrink-0 accent-[#5f0c66]"
                onChange={(event) => updateField("acceptedTerms", event.target.checked)}
                required
                type="checkbox"
              />
              <span>
                I agree to the{" "}
                <a className="font-semibold text-[#5f0c66] hover:underline" href="https://app.zewadi.com/terms" rel="noreferrer" target="_blank">
                  Terms and Conditions
                </a>{" "}
                &amp;{" "}
                <a className="font-semibold text-[#5f0c66] hover:underline" href="https://app.zewadi.com/privacy-policy" rel="noreferrer" target="_blank">
                  Privacy Policy
                </a>
              </span>
            </label>

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
              {isSubmitting ? "Sending Verification Code..." : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#4b5563]">
            Already have an account?{" "}
            <Link className="font-semibold text-[#e39b4d]" href="/login">
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

type FormFieldProps = {
  children: React.ReactNode;
  icon: typeof User;
  label: string;
};

function FormField({ children, icon: Icon, label }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#374151]">{label}</span>
      <span className="relative block">
        <Icon aria-hidden="true" className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
        {children}
      </span>
    </label>
  );
}

function SignupBrandPanel() {
  return (
    <section className="relative hidden h-full min-h-[100dvh] overflow-hidden bg-[#5f0c66] lg:flex lg:items-center lg:justify-center">
      <img
        alt=""
        className="absolute inset-0 size-full object-cover opacity-35 mix-blend-luminosity"
        src="/login-background.jpg"
      />
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(95,12,102,0.92),rgba(88,28,135,0.82),rgba(95,12,102,0.9))]" />
      <Link className="relative z-10 block h-[130px] w-[268px]" href="/">
        <img alt="Tijaruk" className="size-full object-contain" src="/tijaruk-logo.svg" />
      </Link>
    </section>
  );
}

type PasswordFieldProps = {
  label: string;
  onChange: (value: string) => void;
  onToggle: () => void;
  placeholder: string;
  show: boolean;
  value: string;
};

function PasswordField({
  label,
  onChange,
  onToggle,
  placeholder,
  show,
  value,
}: PasswordFieldProps) {
  return (
    <FormField icon={LockKeyhole} label={label}>
      <input
        autoComplete={label === "Password" ? "new-password" : "new-password"}
        className="signup-input pr-11"
        minLength={8}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        type={show ? "text" : "password"}
        value={value}
      />
      <button
        aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition hover:text-[#5f0c66]"
        onClick={onToggle}
        type="button"
      >
        {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </FormField>
  );
}
