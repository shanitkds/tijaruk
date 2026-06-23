"use client";

import { FormEvent, WheelEvent, useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { dashboardToast } from "../admin/AdminToast";
import {
  BriefcaseBusiness,
  Building2,
  Camera,
  Mail,
  MapPin,
  Phone,
  UserRound,
  X,
} from "lucide-react";
import type { UserProfileData } from "./userDashboardData";

type LookupOption = {
  id: number;
  name: string;
};

export default function ProfileEditModal({
  company,
  onClose,
  onSave,
  open,
  user,
}: {
  company: UserProfileData["company"];
  onClose: () => void;
  onSave: (values: FormData) => Promise<void>;
  open: boolean;
  user: UserProfileData["user"];
}) {
  const initialValues = {
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    location: user.location,
    language: user.language,
    businessName: company.name,
    crNumber: company.crNumber || "",
    businessTypeId: company.businessTypeId ? String(company.businessTypeId) : "",
    industryId: company.industryId ? String(company.industryId) : "",
    status: company.status || "ACTIVE",
    description: company.description || "",
    website: company.website || "",
    contactPerson: company.contactPerson || user.name,
    businessEmail: company.email || user.email,
    businessPhone: company.phone || user.phone,
  };
  const [formValues, setFormValues] = useState(initialValues);
  const [photo, setPhoto] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(user.avatar);
  const [logoPreview, setLogoPreview] = useState(company.logo);
  const [businessTypes, setBusinessTypes] = useState<LookupOption[]>([]);
  const [industries, setIndustries] = useState<LookupOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (error) dashboardToast.error("Unable to update profile", error);
  }, [error]);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const wheelDeltaRef = useRef(0);
  const wheelFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setFormValues({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location,
      language: user.language,
      businessName: company.name,
      crNumber: company.crNumber || "",
      businessTypeId: company.businessTypeId ? String(company.businessTypeId) : "",
      industryId: company.industryId ? String(company.industryId) : "",
      status: company.status || "ACTIVE",
      description: company.description || "",
      website: company.website || "",
      contactPerson: company.contactPerson || user.name,
      businessEmail: company.email || user.email,
      businessPhone: company.phone || user.phone,
    });
    setPhoto(null);
    setLogo(null);
    setPhotoPreview(user.avatar);
    setLogoPreview(company.logo);
    setError("");
  }, [company, open, user]);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(user.avatar);
      return;
    }
    const nextPreview = URL.createObjectURL(photo);
    setPhotoPreview(nextPreview);
    return () => URL.revokeObjectURL(nextPreview);
  }, [photo, user.avatar]);

  useEffect(() => {
    if (!logo) {
      setLogoPreview(company.logo);
      return;
    }
    const nextPreview = URL.createObjectURL(logo);
    setLogoPreview(nextPreview);
    return () => URL.revokeObjectURL(nextPreview);
  }, [company.logo, logo]);

  useEffect(() => {
    if (!open) {
      return;
    }

    Promise.all([
      api.get<LookupOption[]>("/business-types/"),
      api.get<LookupOption[]>("/industries/"),
    ])
      .then(([businessTypeResponse, industryResponse]) => {
        setBusinessTypes(businessTypeResponse.data);
        setIndustries(industryResponse.data);
      })
      .catch(() => setError("Unable to load business options."));
  }, [open]);

  if (!open) {
    return null;
  }

  const fields = [
    { key: "name", label: "Full Name", icon: UserRound, type: "text" },
    { key: "username", label: "Username", icon: UserRound, type: "text" },
    { key: "email", label: "User Email", icon: Mail, type: "email" },
    { key: "phone", label: "User Phone", icon: Phone, type: "tel" },
    { key: "role", label: "Job Title", icon: BriefcaseBusiness, type: "text" },
  ] as const;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("full_name", formValues.name);
      formData.append("username", formValues.username);
      formData.append("email", formValues.email);
      formData.append("phone", formValues.phone);
      formData.append("user_role", formValues.role);
      formData.append("language", formValues.language);
      formData.append("business_name", formValues.businessName);
      formData.append("cr_number", formValues.crNumber);
      if (formValues.businessTypeId) formData.append("business_type", formValues.businessTypeId);
      if (formValues.industryId) formData.append("industry", formValues.industryId);
      formData.append("business_status", formValues.status);
      formData.append("business_description", formValues.description);
      formData.append("location", formValues.location);
      formData.append("website", formValues.website);
      formData.append("contact_person", formValues.contactPerson);
      formData.append("business_email", formValues.businessEmail);
      formData.append("business_phone", formValues.businessPhone);
      if (photo) formData.append("photo", photo);
      if (logo) formData.append("logo", logo);
      await onSave(formData);
      onClose();
    } catch {
      setError("Unable to save profile changes.");
    } finally {
      setSaving(false);
    }
  }

  function handleModalWheel(event: WheelEvent<HTMLFormElement>) {
    const scrollBody = scrollBodyRef.current;

    if (!scrollBody) {
      return;
    }

    event.preventDefault();
    wheelDeltaRef.current += event.deltaY * 1.35;

    if (wheelFrameRef.current !== null) {
      return;
    }

    wheelFrameRef.current = window.requestAnimationFrame(() => {
      scrollBody.scrollTop += wheelDeltaRef.current;
      wheelDeltaRef.current = 0;
      wheelFrameRef.current = null;
    });
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/45 px-4 py-4"
      role="dialog"
    >
      <div className="flex h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="shrink-0 border-b border-[#e5e7eb] px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#111827]">Edit Profile</h2>
            <p className="mt-1 text-xs text-[#6b7280]">
              Update your personal details.
            </p>
          </div>
          <button
            aria-label="Close edit profile"
            className="flex size-9 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#6b7280] transition hover:text-[#65096c]"
            disabled={saving}
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
          </div>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
          onWheel={handleModalWheel}
        >
          <div
            className="min-h-0 flex-1 overflow-y-scroll overscroll-contain px-5 py-5 sm:px-6"
            ref={scrollBodyRef}
          >
          <ImagePicker
            fallback={user.username.trim().charAt(0).toUpperCase() || "U"}
            imageClassName="rounded-full"
            label="Profile Photo"
            onChange={setPhoto}
            previewUrl={photoPreview}
          />

          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#65096c]">
            User Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const Icon = field.icon;

              return (
                <label className="block" key={field.key}>
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#6b7280]">
                    {field.label}
                  </span>
                  <span className="flex h-11 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 focus-within:border-[#65096c] focus-within:ring-2 focus-within:ring-[#65096c]/15">
                    <Icon className="size-3.5 shrink-0 text-[#9ca3af]" />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-xs text-[#374151] outline-none"
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                      required={field.key === "name" || field.key === "email"}
                      type={field.type}
                      value={formValues[field.key]}
                    />
                  </span>
                </label>
              );
            })}
            <LanguageSelect
              onChange={(value) => setFormValues((current) => ({ ...current, language: value }))}
              value={formValues.language}
            />
          </div>

          <h3 className="mb-3 mt-6 text-xs font-bold uppercase tracking-wide text-[#65096c]">
            Business Information
          </h3>
          <ImagePicker
            fallback={<Building2 className="size-8" />}
            imageClassName="rounded-2xl"
            label="Business Logo"
            onChange={setLogo}
            previewUrl={logoPreview}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              icon={BriefcaseBusiness}
              label="Business Name"
              onChange={(value) => setFormValues((current) => ({ ...current, businessName: value }))}
              required
              value={formValues.businessName}
            />
            <TextField
              icon={BriefcaseBusiness}
              label="CR Number"
              onChange={(value) => setFormValues((current) => ({ ...current, crNumber: value }))}
              required
              value={formValues.crNumber}
            />
            <SelectField
              label="Business Type"
              onChange={(value) => setFormValues((current) => ({ ...current, businessTypeId: value }))}
              options={businessTypes}
              value={formValues.businessTypeId}
            />
            <SelectField
              label="Industry"
              onChange={(value) => setFormValues((current) => ({ ...current, industryId: value }))}
              options={industries}
              value={formValues.industryId}
            />
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#6b7280]">
                Business Status
              </span>
              <select
                className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 text-xs text-[#374151] outline-none focus:border-[#65096c] focus:ring-2 focus:ring-[#65096c]/15"
                onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
                value={formValues.status}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
              </select>
            </label>
            <TextField
              icon={MapPin}
              label="Location"
              onChange={(value) => setFormValues((current) => ({ ...current, location: value }))}
              required
              value={formValues.location}
            />
            <TextField
              icon={BriefcaseBusiness}
              label="Website"
              onChange={(value) => setFormValues((current) => ({ ...current, website: value }))}
              type="url"
              value={formValues.website}
            />
            <TextField
              icon={UserRound}
              label="Contact Person"
              onChange={(value) => setFormValues((current) => ({ ...current, contactPerson: value }))}
              required
              value={formValues.contactPerson}
            />
            <TextField
              icon={Mail}
              label="Business Email"
              onChange={(value) => setFormValues((current) => ({ ...current, businessEmail: value }))}
              required
              type="email"
              value={formValues.businessEmail}
            />
            <TextField
              icon={Phone}
              label="Business Phone"
              onChange={(value) => setFormValues((current) => ({ ...current, businessPhone: value }))}
              required
              type="tel"
              value={formValues.businessPhone}
            />
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#6b7280]">
                Business Description
              </span>
              <textarea
                className="min-h-24 w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-3 text-xs text-[#374151] outline-none focus:border-[#65096c] focus:ring-2 focus:ring-[#65096c]/15"
                onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
                required
                value={formValues.description}
              />
            </label>
          </div>

          </div>

          <div className="shrink-0 border-t border-[#e5e7eb] bg-white px-5 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              className="h-10 rounded-xl bg-[#f3f4f6] px-5 text-sm font-semibold text-[#6b7280]"
              disabled={saving}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-xl bg-[#65096c] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImagePicker({
  fallback,
  imageClassName,
  label,
  onChange,
  previewUrl,
}: {
  fallback: React.ReactNode;
  imageClassName: string;
  label: string;
  onChange: (file: File | null) => void;
  previewUrl: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-5 flex flex-col items-center text-center">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-[#6b7280]">
        {label}
      </span>
      <div className="relative">
        <button
          aria-label={`Edit ${label}`}
          className={`flex size-24 items-center justify-center overflow-hidden border border-[#e5e7eb] bg-[#f3e8f4] text-2xl font-bold text-[#65096c] shadow-sm ${imageClassName}`}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {previewUrl ? (
            <img
              alt={label}
              className="size-full object-cover"
              src={previewUrl}
            />
          ) : (
            fallback
          )}
        </button>
        <button
          aria-label={`Choose ${label}`}
          className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#65096c] text-white shadow-md"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <Camera className="size-4" />
        </button>
      </div>
      <input
        accept="image/*"
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}

function LanguageSelect({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#6b7280]">
        Language
      </span>
      <select
        className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 text-xs text-[#374151] outline-none focus:border-[#65096c] focus:ring-2 focus:ring-[#65096c]/15"
        onChange={(event) => onChange(event.target.value)}
        value={value === "Arabic" ? "Arabic (AR)" : value === "English" ? "English (EN)" : value}
      >
        <option value="English (EN)">English</option>
        <option value="Arabic (AR)">Arabic</option>
      </select>
    </label>
  );
}

function TextField({
  icon: Icon,
  label,
  onChange,
  required = false,
  type = "text",
  value,
}: {
  icon: typeof UserRound;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#6b7280]">
        {label}
      </span>
      <span className="flex h-11 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 focus-within:border-[#65096c] focus-within:ring-2 focus-within:ring-[#65096c]/15">
        <Icon className="size-3.5 shrink-0 text-[#9ca3af]" />
        <input
          className="min-w-0 flex-1 bg-transparent text-xs text-[#374151] outline-none"
          onChange={(event) => onChange(event.target.value)}
          required={required}
          type={type}
          value={value}
        />
      </span>
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: LookupOption[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#6b7280]">
        {label}
      </span>
      <select
        className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 text-xs text-[#374151] outline-none focus:border-[#65096c] focus:ring-2 focus:ring-[#65096c]/15"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
