"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Building2, Camera, Check, Info, Languages, MapPin, UserRound } from "lucide-react";
import api from "../../api/axios";
import { dashboardToast } from "../admin/AdminToast";
import type { BusinessProfileResponse } from "./userDashboardData";

export default function BusinessProfileSetupModal({
  onComplete,
}: {
  onComplete: (profile: BusinessProfileResponse) => void;
}) {
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState("English (EN)");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;

    api
      .get<BusinessProfileResponse>("/business-profile/")
      .then(({ data }) => {
        if (!mounted) return;
        setLocation(data.company.location || data.user.location || "");
        setLanguage(data.user.language || "English (EN)");
        setPhotoPreview(data.user.avatar || "");
      })
      .catch(() => setError("Unable to load your current profile information."))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (error) dashboardToast.error("Unable to create business profile", error);
  }, [error]);

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function handlePhotoChange(file: File | null) {
    setPhoto(file);
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("location", location.trim());
      formData.append("language", language);
      if (photo) formData.append("photo", photo);

      const { data } = await api.patch<BusinessProfileResponse>(
        "/business-profile/",
        formData,
      );
      dashboardToast.success(
        "Business profile created",
        "Your dashboard profile is now ready.",
      );
      onComplete(data);
    } catch (saveError: any) {
      const responseError = saveError?.response?.data;
      const firstFieldError =
        responseError && typeof responseError === "object"
          ? Object.values(responseError).flat().join(" ")
          : "";
      setError(firstFieldError || "Unable to create your business profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#160717]/55 px-3 py-4 backdrop-blur-sm"
      role="dialog"
    >
      <form
        className="max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-[18px] border border-[#f0dff0] bg-white shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#f2e5f2] px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#8a238f]">
              Business setup required
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#3c1240]">
              Create your business profile
            </h2>
          </div>
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#f7eef8] text-[#65096c]">
            <Building2 className="size-4" />
          </span>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-7">
          <div className="flex gap-3 rounded-xl border border-[#eadbea] bg-[#fbf8fc] p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-[#65096c]" />
            <p className="text-sm leading-6 text-[#6f6371]">
              Your business profile will be created using your current account
              information. Add your location and select your language to continue.
            </p>
          </div>

          <div>
            <FieldLabel label="Profile Photo (optional)" />
            <div className="flex items-center gap-4 rounded-xl border border-[#eadbea] bg-[#fbf8fc] p-3">
              <div className="relative size-16 shrink-0">
                <button
                  aria-label="Choose profile photo"
                  className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-[#eadbea] bg-white text-[#65096c]"
                  onClick={() => photoInputRef.current?.click()}
                  type="button"
                >
                  {photoPreview ? (
                    <img
                      alt="Profile preview"
                      className="size-full object-cover"
                      src={photoPreview}
                    />
                  ) : (
                    <UserRound className="size-7" />
                  )}
                </button>
                <button
                  aria-label="Choose profile photo"
                  className="absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#65096c] text-white shadow-sm"
                  onClick={() => photoInputRef.current?.click()}
                  type="button"
                >
                  <Camera className="size-3.5" strokeWidth={2.25} />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-5 text-[#7f7480]">
                  Add a photo for your user profile. You can skip this step.
                </p>
                <button
                  className="mt-2 rounded-lg border border-[#e99a3f] px-4 py-2 text-xs font-bold text-[#e28425]"
                  onClick={() => photoInputRef.current?.click()}
                  type="button"
                >
                  Choose Photo
                </button>
              </div>
              <input
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => handlePhotoChange(event.target.files?.[0] || null)}
                ref={photoInputRef}
                type="file"
              />
            </div>
          </div>

          <TextField
            icon={<MapPin className="size-4" />}
            label="Location"
            onChange={setLocation}
            placeholder="e.g. Riyadh, Saudi Arabia"
            required
            value={location}
          />

          <label className="block">
            <FieldLabel label="Language" />
            <span className="flex h-12 items-center gap-2 rounded-xl border border-[#eadbea] bg-[#fbf8fc] px-3 focus-within:border-[#cf95d3] focus-within:ring-2 focus-within:ring-[#65096c]/10">
              <Languages className="size-4 shrink-0 text-[#9aa1ad]" />
              <select
                className="min-w-0 flex-1 bg-transparent text-sm text-[#3f3441] outline-none"
                onChange={(event) => setLanguage(event.target.value)}
                value={language}
              >
                <option value="English (EN)">English</option>
                <option value="Arabic (AR)">Arabic</option>
              </select>
            </span>
          </label>
        </div>

        <div className="flex justify-end border-t border-[#f2e5f2] bg-white px-5 py-4 sm:px-7">
          <button
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#e99a3f] px-7 text-sm font-bold text-white shadow-lg shadow-[#e99a3f]/25 transition hover:bg-[#db8c31] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving || loading}
            type="submit"
          >
            <Check className="size-4" />
            {saving ? "Creating..." : "Create and Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="mb-1.5 block text-xs font-bold text-[#65096c]">
      {label} {required ? <span className="text-[#e99a3f]">*</span> : null}
    </span>
  );
}

function TextField({
  icon,
  label,
  onChange,
  placeholder,
  required = false,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <span className="flex h-12 items-center gap-2 rounded-xl border border-[#eadbea] bg-[#fbf8fc] px-3 focus-within:border-[#cf95d3] focus-within:ring-2 focus-within:ring-[#65096c]/10">
        <span className="shrink-0 text-[#9aa1ad]">{icon}</span>
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-[#3f3441] outline-none placeholder:text-[#a1a7b3]"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          value={value}
        />
      </span>
    </label>
  );
}
