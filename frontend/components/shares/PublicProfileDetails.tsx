"use client";

import { ChevronDown, CircleUserRound, Mail, Phone, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

export type PublicProfile = {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  initial: string;
};

export type PublicProfileValues = Pick<PublicProfile, "name" | "email" | "phone">;

export default function PublicProfileDetails({
  error,
  isEditing,
  isSaving,
  onCancel,
  onEdit,
  onSave,
  profile,
}: {
  error: string;
  isEditing: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onEdit: () => void;
  onSave: (values: PublicProfileValues) => Promise<void>;
  profile: PublicProfile;
}) {
  const [values, setValues] = useState<PublicProfileValues>({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
  });

  useEffect(() => {
    setValues({ name: profile.name, email: profile.email, phone: profile.phone });
  }, [isEditing, profile.email, profile.name, profile.phone]);

  return (
    <section className="rounded-2xl border border-[#dedede] bg-white p-[4%] shadow-sm">
      <div className="mb-[4%] flex items-start justify-between gap-[3%]">
        <h2 className="text-2xl font-bold text-[#171717]">Personal Information</h2>
        {isEditing ? (
          <div className="flex w-[48%] shrink-0 items-center justify-end gap-[8%] sm:w-[32%]">
            <button
              className="text-sm font-medium text-[#6b7280]"
              disabled={isSaving}
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className="w-[48%] rounded-full bg-[#65096c] py-[5%] text-sm font-bold text-white disabled:opacity-60"
              disabled={isSaving}
              onClick={() => void onSave(values)}
              type="button"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <button className="shrink-0 text-sm font-medium text-[#e39b4d]" onClick={onEdit} type="button">
            Edit Profile
          </button>
        )}
      </div>

      {error ? (
        <p className="mb-[3%] rounded-lg bg-red-50 p-[2%] text-sm font-medium text-red-700">{error}</p>
      ) : null}

      <div className="grid gap-x-[6%] gap-y-6 sm:grid-cols-2">
        <InfoField
          editable={isEditing}
          icon={UserRound}
          label="Full Name"
          onChange={(name) => setValues((current) => ({ ...current, name }))}
          value={values.name}
        />
        <InfoField
          editable={false}
          icon={Mail}
          inputType="email"
          label="Email Address"
          value={values.email}
        />
        <InfoField
          editable={isEditing}
          icon={Phone}
          inputType="tel"
          label="Phone Number"
          onChange={(phone) => setValues((current) => ({ ...current, phone }))}
          value={values.phone}
        />
        <InfoField
          editable={false}
          icon={CircleUserRound}
          label="Role Type"
          value={profile.role || "Guest"}
          showChevron
        />
      </div>
    </section>
  );
}

function InfoField({
  editable,
  icon: Icon,
  inputType = "text",
  label,
  onChange,
  showChevron = false,
  value,
}: {
  editable: boolean;
  icon: typeof UserRound;
  inputType?: "email" | "tel" | "text";
  label: string;
  onChange?: (value: string) => void;
  showChevron?: boolean;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-[#a3a3a3]">{label}</p>
      <div className="mt-[1%] flex min-h-8 items-center gap-[2%] border-b border-[#eeeeee] pb-[2%]">
        <Icon className="size-4 shrink-0 text-[#8a8f99]" />
        {editable ? (
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-[#171717] outline-none"
            onChange={(event) => onChange?.(event.target.value)}
            placeholder={label === "Phone Number" ? "Not added" : ""}
            required={label !== "Phone Number"}
            type={inputType}
            value={value}
          />
        ) : (
          <p className="min-w-0 flex-1 truncate text-sm text-[#171717]">{value || "Not added"}</p>
        )}
        {showChevron ? <ChevronDown className="size-4 text-[#6b7280]" /> : null}
      </div>
    </div>
  );
}
