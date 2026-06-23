"use client";

import { BriefcaseBusiness, Languages, Mail, MapPin, Phone, UserRound } from "lucide-react";
import type { UserProfileData } from "./userDashboardData";

type PersonalInfoValues = Pick<
  UserProfileData["user"],
  "name" | "email" | "phone" | "role" | "location" | "language"
>;

export default function ProfilePersonalInfo({
  user,
}: {
  user: UserProfileData["user"];
  onSave: (values: PersonalInfoValues) => Promise<void>;
}) {
  const fields = [
    { key: "name", label: "Full Name", icon: UserRound },
    { key: "email", label: "Email Address", icon: Mail },
    { key: "phone", label: "Phone Number", icon: Phone },
    { key: "role", label: "Job Title", icon: BriefcaseBusiness },
    { key: "location", label: "Location", icon: MapPin },
    { key: "language", label: "Language", icon: Languages },
  ] as const;

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#111827]">Personal Information</h2>
          <p className="text-xs text-[#9ca3af]">Update your personal details</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const Icon = field.icon;

          return (
            <label className="block" key={field.label}>
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#6b7280]">
                {field.label}
              </span>
              <span className="flex h-11 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3">
                <Icon className="size-3.5 shrink-0 text-[#9ca3af]" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-xs text-[#374151] outline-none"
                  readOnly
                  value={user[field.key]}
                />
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
