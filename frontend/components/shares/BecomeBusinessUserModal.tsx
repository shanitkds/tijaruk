"use client";

import { FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import api from "../../api/axios";
import {
  AUTH_STORAGE_KEY,
  getAuthSession,
  setAuthSession,
  type AuthSession,
} from "../../lib/auth";

type BecomeBusinessUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: AuthSession) => void;
};

const benefits = [
  {
    icon: LayoutDashboard,
    title: "Dashboard access",
    text: "Track RFQs, products, updates, and business activity in one place.",
  },
  {
    icon: MessageCircle,
    title: "Messages",
    text: "Receive and manage direct communication from the Tijaruk team.",
  },
  {
    icon: ShieldCheck,
    title: "Business tools",
    text: "Use a verified business workspace for sourcing and order workflows.",
  },
];

export default function BecomeBusinessUserModal({
  isOpen,
  onClose,
  onSuccess,
}: BecomeBusinessUserModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!acceptedTerms || isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const { data } = await api.post<AuthSession>("/accounts/become-user/", {
        accepted_terms: acceptedTerms,
      });
      const remembered = Boolean(
        window.localStorage.getItem(AUTH_STORAGE_KEY) || !getAuthSession(),
      );
      setAuthSession(data, remembered);
      onSuccess(data);
    } catch (caughtError) {
      const message =
        caughtError &&
        typeof caughtError === "object" &&
        "response" in caughtError &&
        (caughtError as { response?: { data?: { error?: string; accepted_terms?: string[] } } })
          .response?.data
          ? (caughtError as { response?: { data?: { error?: string; accepted_terms?: string[] } } })
              .response?.data?.error ||
            (caughtError as { response?: { data?: { accepted_terms?: string[] } } }).response
              ?.data?.accepted_terms?.[0]
          : "";
      setError(message || "Unable to update your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-start justify-center overflow-y-auto bg-black/45 px-4 pb-8 pt-8 font-['Poppins',sans-serif] sm:pt-10">
      <div className="w-full max-w-[470px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(31,17,35,0.3)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#eef0f3] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#e39b4d]">
              Business account
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#111827]">
              Become a user
            </h2>
            <p className="mt-1 text-sm leading-5 text-[#64748b]">
              Activate dashboard access and business features for your account.
            </p>
          </div>
          <button
            aria-label="Close"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#64748b] transition hover:bg-[#f8f3f8] hover:text-[#5f0c66]"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        <form className="px-6 py-5" onSubmit={handleSubmit}>
          <div className="space-y-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div
                className="flex gap-3 rounded-xl border border-[#eef0f3] bg-[#fbfafb] p-3"
                key={title}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#5f0c66]/10 text-[#5f0c66]">
                  <Icon className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm font-semibold text-[#111827]">
                    {title}
                  </strong>
                  <span className="mt-0.5 block text-xs leading-5 text-[#64748b]">
                    {text}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-5 text-[#475569]">
            <input
              checked={acceptedTerms}
              className="mt-0.5 size-4 shrink-0 accent-[#5f0c66]"
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              required
              type="checkbox"
            />
            <span>
              I agree to the{" "}
              <a
                className="font-semibold text-[#5f0c66] hover:underline"
                href="https://app.zewadi.com/terms"
                rel="noreferrer"
                target="_blank"
              >
                Terms and Conditions
              </a>{" "}
              &amp;{" "}
              <a
                className="font-semibold text-[#5f0c66] hover:underline"
                href="https://app.zewadi.com/privacy-policy"
                rel="noreferrer"
                target="_blank"
              >
                Privacy Policy
              </a>
            </span>
          </label>

          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="h-11 rounded-xl border border-[#e5e7eb] px-5 text-sm font-semibold text-[#475569] transition hover:bg-[#f8f3f8]"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#5f0c66] px-5 text-sm font-semibold text-white transition hover:bg-[#500957] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!acceptedTerms || isSubmitting}
              type="submit"
            >
              <CheckCircle2 className="size-4" />
              {isSubmitting ? "Updating..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
