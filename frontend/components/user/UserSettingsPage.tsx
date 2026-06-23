import { CreditCard, Plug, Save, Settings2, ShieldCheck } from "lucide-react";
import SettingsGeneralPanel from "./SettingsGeneralPanel";
import SettingsSecurityPanel from "./SettingsSecurityPanel";
import SettingsSidePanel from "./SettingsSidePanel";
import type { UserSettingsData } from "./userDashboardData";

export default function UserSettingsPage({ data }: { data: UserSettingsData }) {
  return (
    <section className="mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937]">Account Settings</h1>
          <p className="mt-1 text-sm text-[#9ca3af]">
            Manage your preferences, security, integrations and billing
          </p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#65096c] px-5 text-sm font-semibold text-white" type="button">
          <Save className="size-3.5" />
          Save All Changes
        </button>
      </div>

      <div className="mt-5 flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-[#e5e7eb] bg-white p-1">
        {[
          [Settings2, "General"],
          [ShieldCheck, "Security"],
          [Plug, "Integrations"],
          [CreditCard, "Billing"],
        ].map(([Icon, label], index) => {
          const TabIcon = Icon as typeof Settings2;
          return (
            <button
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold ${
                index === 0 ? "bg-[#65096c] text-white" : "text-[#6b7280]"
              }`}
              key={label as string}
              type="button"
            >
              <TabIcon className="size-3.5" />
              {label as string}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 gap-5">
          <SettingsGeneralPanel preferences={data.preferences} />
          <SettingsSecurityPanel security={data.security} />
        </div>
        <SettingsSidePanel />
      </div>
    </section>
  );
}
