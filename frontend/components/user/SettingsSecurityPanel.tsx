"use client";

import { ShieldCheck, Smartphone } from "lucide-react";
import type { UserSettingsData } from "./userDashboardData";
import TwoFactorAuthConfirmation, { useTwoFactorAuth } from "./TwoFactorAuthConfirmation";

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      className={`relative h-6 w-11 rounded-full ${checked ? "bg-[#65096c]" : "bg-[#e5e7eb]"}`}
      disabled={disabled}
      onClick={onChange}
      type="button"
    >
      <span
        className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export default function SettingsSecurityPanel({
  security,
}: {
  security: UserSettingsData["security"];
}) {
  const twoFactor = useTwoFactorAuth(security.twoFactorEnabled);

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#ffe4e6] text-[#ef4444]">
          <ShieldCheck className="size-4" />
        </span>
        <div>
          <h2 className="text-base font-bold text-[#1f2937]">Security & Privacy</h2>
          <p className="text-xs text-[#9ca3af]">Protect your account and control visibility</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
        <Smartphone className="size-4 text-[#65096c]" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#374151]">Two-Factor Authentication</p>
          <p className={`text-[10px] ${twoFactor.enabled ? "text-[#10b981]" : "text-[#9ca3af]"}`}>
            {twoFactor.enabled ? "Enabled - Email OTP" : "Disabled"}
          </p>
        </div>
        <span className="text-[10px] text-[#9ca3af]">{twoFactor.enabled ? "ON" : "OFF"}</span>
        <Toggle
          checked={twoFactor.enabled}
          disabled={twoFactor.isSaving}
          onChange={twoFactor.requestChange}
        />
      </div>
      <TwoFactorAuthConfirmation
        enabled={twoFactor.enabled}
        isSaving={twoFactor.isSaving}
        onCancel={twoFactor.cancelChange}
        onConfirm={twoFactor.confirmChange}
        open={twoFactor.confirmationOpen}
      />
    </section>
  );
}
