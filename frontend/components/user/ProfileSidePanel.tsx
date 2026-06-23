"use client";

import { useState } from "react";
import { KeyRound, LockKeyhole } from "lucide-react";
import type { UserProfileData } from "./userDashboardData";
import NotificationPreferencesCard from "./NotificationPreferencesCard";
import PasswordChangeModal from "./PasswordChangeModal";
import TwoFactorAuthConfirmation, { useTwoFactorAuth } from "./TwoFactorAuthConfirmation";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      aria-pressed={checked}
      className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-[#65096c]" : "bg-[#e5e7eb]"}`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition ${
          checked ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function ProfileSidePanel({
  data,
}: {
  data: Pick<UserProfileData, "security" | "notificationPreferences" | "recentActivity">;
}) {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(data.security.passwordUpdated);
  const twoFactor = useTwoFactorAuth(data.security.twoFactorEnabled);

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-[#111827]">Account Security</h2>
        <p className="mb-4 text-xs text-[#9ca3af]">Protect your account</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-[#f9fafb] p-3">
            <LockKeyhole className="size-4 text-[#9ca3af]" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#374151]">Password</p>
              <p className="text-[10px] text-[#9ca3af]">Last changed {passwordUpdated}</p>
            </div>
            <button
              className="rounded-lg bg-[#65096c] px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-[#500957]"
              onClick={() => setPasswordModalOpen(true)}
              type="button"
            >
              Change
            </button>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[#f9fafb] p-3">
            <KeyRound className="size-4 text-[#9ca3af]" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#374151]">Two-Factor Auth</p>
              <p className={`text-[10px] ${twoFactor.enabled ? "text-[#10b981]" : "text-[#9ca3af]"}`}>
                {twoFactor.enabled ? "Enabled - Email OTP" : "Disabled"}
              </p>
            </div>
            <Toggle checked={twoFactor.enabled} onChange={twoFactor.requestChange} />
          </div>
          <div className="rounded-xl bg-[#dff9ee] p-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#059669]">
              <span>Security Score</span>
              <span>{data.security.score}/100</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-[#10b981]" style={{ width: `${data.security.score}%` }} />
            </div>
            <p className="mt-2 text-[10px] text-[#059669]">Your account is well protected</p>
          </div>
        </div>
      </section>
      <TwoFactorAuthConfirmation
        enabled={twoFactor.enabled}
        isSaving={twoFactor.isSaving}
        onCancel={twoFactor.cancelChange}
        onConfirm={twoFactor.confirmChange}
        open={twoFactor.confirmationOpen}
      />
      <PasswordChangeModal
        onChanged={() => setPasswordUpdated("just now")}
        onClose={() => setPasswordModalOpen(false)}
        open={passwordModalOpen}
      />

      <NotificationPreferencesCard initialPreferences={data.notificationPreferences} />
    </div>
  );
}
