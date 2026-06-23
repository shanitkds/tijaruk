"use client";

import { useState } from "react";
import { ChevronDown, Clock3, Globe2, SlidersHorizontal, WalletCards } from "lucide-react";
import type { UserSettingsData } from "./userDashboardData";

export default function SettingsGeneralPanel({
  preferences,
}: {
  preferences: UserSettingsData["preferences"];
}) {
  const [values, setValues] = useState(preferences);
  const fields = [
    {
      key: "language",
      label: "Language",
      icon: Globe2,
      options: ["English (EN)", "Arabic (AR)", "French (FR)"],
    },
    {
      key: "timezone",
      label: "Timezone",
      icon: Clock3,
      options: ["Gulf Standard Time", "UTC", "Arabia Standard Time"],
    },
    {
      key: "currency",
      label: "Currency",
      icon: WalletCards,
      options: ["AED - UAE Dirham", "SAR - Saudi Riyal", "USD - US Dollar"],
    },
  ] as const;

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#f3e8f4] text-[#65096c]">
          <SlidersHorizontal className="size-4" />
        </span>
        <div>
          <h2 className="text-base font-bold text-[#1f2937]">General Preferences</h2>
          <p className="text-xs text-[#9ca3af]">Customize your portal experience</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {fields.map((field) => {
          const Icon = field.icon;

          return (
            <label key={field.key}>
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#6b7280]">
                {field.label}
              </span>
              <span className="relative flex h-11 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3">
                <Icon className="size-3.5 text-[#65096c]" />
                <select
                  className="min-w-0 flex-1 appearance-none bg-transparent text-xs font-medium text-[#374151] outline-none"
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.key]: event.target.value }))
                  }
                  value={values[field.key]}
                >
                  {field.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none size-3 text-[#9ca3af]" />
              </span>
              {field.key === "timezone" ? (
                <span className="mt-2 block text-[10px] text-[#9ca3af]">UTC +4:00 - Dubai, Abu Dhabi</span>
              ) : field.key === "currency" ? (
                <span className="mt-2 block text-[10px] text-[#9ca3af]">Used for pricing & invoices</span>
              ) : null}
            </label>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-[#f1f3f5] pt-5">
        <button className="rounded-xl bg-[#65096c] px-5 py-2.5 text-xs font-semibold text-white" type="button">
          Save Preferences
        </button>
        <button
          className="rounded-xl bg-[#f3f4f6] px-5 py-2.5 text-xs font-semibold text-[#6b7280]"
          onClick={() => setValues(preferences)}
          type="button"
        >
          Reset to Default
        </button>
      </div>
    </section>
  );
}
