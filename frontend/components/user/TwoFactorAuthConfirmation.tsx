"use client";

import { useEffect, useState } from "react";
import { Mail, ShieldCheck, X } from "lucide-react";
import api from "../../api/axios";
import { dashboardToast } from "../admin/AdminToast";

export function useTwoFactorAuth(initialEnabled: boolean) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api.get<{ two_factor_enabled: boolean }>("/user-settings/")
      .then(({ data }) => {
        if (active) setEnabled(data.two_factor_enabled);
      })
      .catch(() => {
        if (active) dashboardToast.error("Unable to load two-factor settings", "Please try again.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function confirmChange() {
    setIsSaving(true);
    try {
      const { data } = await api.patch<{ two_factor_enabled: boolean }>(
        "/user-settings/",
        { two_factor_enabled: !enabled },
      );
      setEnabled(data.two_factor_enabled);
      setConfirmationOpen(false);
      dashboardToast.success(
        data.two_factor_enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
        data.two_factor_enabled
          ? "Email verification will be required at your next sign-in."
          : "Two-factor authentication is now disabled.",
      );
    } catch {
      setConfirmationOpen(false);
      dashboardToast.error("Unable to update two-factor authentication", "Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    enabled,
    confirmationOpen,
    isSaving,
    requestChange: () => setConfirmationOpen(true),
    cancelChange: () => {
      if (!isSaving) setConfirmationOpen(false);
    },
    confirmChange,
  };
}

export default function TwoFactorAuthConfirmation({
  enabled,
  isSaving,
  open,
  onCancel,
  onConfirm,
}: {
  enabled: boolean;
  isSaving: boolean;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onCancel, open]);

  if (!open) return null;

  const action = enabled ? "Disable" : "Enable";

  return (
    <div
      aria-labelledby="two-factor-confirmation-title"
      aria-modal="true"
      className="fixed inset-0 z-[1500] flex items-center justify-center bg-[#111827]/55 px-4 py-5 backdrop-blur-[2px] sm:px-6 sm:py-8 md:px-8 lg:px-10 xl:px-12"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onCancel();
      }}
      role="dialog"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-5 shadow-[0_24px_80px_rgba(17,24,39,0.28)] sm:max-w-lg sm:rounded-3xl sm:p-6 md:p-7 lg:max-w-xl lg:p-8 xl:max-w-xl">
        <button
          aria-label="Close confirmation"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#65096c] disabled:opacity-50 sm:right-5 sm:top-5"
          disabled={isSaving}
          onClick={onCancel}
          type="button"
        >
          <X className="size-4 sm:size-5" />
        </button>

        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f3e8f4] text-[#65096c] sm:size-14">
          <ShieldCheck className="size-6 sm:size-7" />
        </span>

        <h2
          className="mt-5 pr-8 text-lg font-bold text-[#111827] sm:text-xl md:text-2xl"
          id="two-factor-confirmation-title"
        >
          {action} Two-Factor Authentication?
        </h2>
        <p className="mt-2 text-xs leading-5 text-[#6b7280] sm:text-sm sm:leading-6">
          {enabled
            ? "Your next sign-in will only require your email and password. You can enable email verification again at any time."
            : "After your email and password are accepted, we will send a six-digit verification code to your registered email address."}
        </p>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#e9d5ec] bg-[#faf5fb] p-3 sm:mt-6 sm:p-4">
          <Mail className="mt-0.5 size-4 shrink-0 text-[#65096c] sm:size-5" />
          <p className="text-[11px] leading-5 text-[#4b5563] sm:text-xs">
            {enabled
              ? "Disabling this reduces the protection on your business account."
              : "The code expires after 10 minutes and can only be used once."}
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="h-11 w-full rounded-xl border border-[#d1d5db] px-5 text-sm font-semibold text-[#4b5563] transition hover:bg-[#f9fafb] disabled:opacity-50 sm:w-auto"
            disabled={isSaving}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`h-11 w-full rounded-xl px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${
              enabled ? "bg-[#dc2626] hover:bg-[#b91c1c]" : "bg-[#65096c] hover:bg-[#500957]"
            }`}
            disabled={isSaving}
            onClick={onConfirm}
            type="button"
          >
            {isSaving ? "Saving..." : `${action} Two-Factor Auth`}
          </button>
        </div>
      </div>
    </div>
  );
}
