// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  CloudUpload,
  ImageIcon,
  Languages,
  Mail,
  MapPin,
  Phone,
  Search,
  User,
  UsersRound,
  X,
} from "lucide-react";
import api from "../../api/axios";
import { getAuthSession } from "../../lib/auth";
import NotificationMenu from "../notifications/NotificationMenu";

const emptyForm = {
  full_name: "",
  email: "",
  username: "",
  user_role: "",
  location: "",
  language: "English (EN)",
  phone: "",
  password: "",
  confirm_password: "",
  is_active: "true",
};

function getApiError(error) {
  const data = error?.response?.data;
  if (!data) return "Unable to create user. Please try again.";
  if (typeof data === "string") return data;
  if (data.error) return data.error;
  const firstKey = Object.keys(data)[0];
  const firstValue = data[firstKey];
  if (Array.isArray(firstValue)) return `${firstKey}: ${firstValue[0]}`;
  if (typeof firstValue === "string") return `${firstKey}: ${firstValue}`;
  return "Unable to create user. Please check the form and try again.";
}

function TextField({ label, name, placeholder, value, onChange, type = "text", icon: Icon, required = true }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black leading-none text-[#65096c]">
        {label} {required ? <span className="text-[#e39b4d]">*</span> : null}
      </span>
      <div className="relative">
        {Icon ? <Icon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#aeb1ba]" /> : null}
        <input
          className={`h-9 w-full rounded-[8px] border border-[#eaddec] bg-[#fcf8fd] px-3 text-[12px] font-medium text-[#302637] outline-none transition placeholder:text-[#b4adbd] focus:border-[#65096c] focus:bg-white focus:ring-3 focus:ring-[#65096c]/10 ${Icon ? "pl-8" : ""}`}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
        />
      </div>
    </label>
  );
}

function PasswordField({ label, name, value, onChange, placeholder, required = true }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black leading-none text-[#65096c]">
        {label} {required ? <span className="text-[#e39b4d]">*</span> : null}
      </span>
      <input
        autoComplete="new-password"
        className="h-9 w-full rounded-[8px] border border-[#eaddec] bg-[#fcf8fd] px-3 text-[12px] font-medium text-[#302637] outline-none transition placeholder:text-[#b4adbd] focus:border-[#65096c] focus:bg-white focus:ring-3 focus:ring-[#65096c]/10"
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        type="password"
        value={value}
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, children, disabled = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black leading-none text-[#65096c]">
        {label} <span className="text-[#e39b4d]">*</span>
      </span>
      <div className="relative">
        <select
          className="h-9 w-full appearance-none rounded-[8px] border border-[#eaddec] bg-[#fcf8fd] px-3 pr-9 text-[12px] font-medium text-[#797184] outline-none transition focus:border-[#65096c] focus:bg-white focus:ring-3 focus:ring-[#65096c]/10"
          disabled={disabled}
          name={name}
          onChange={onChange}
          required
          value={value}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[#8b8392]" />
      </div>
    </label>
  );
}

function SectionCard({ icon: Icon, title, iconTone = "purple", children }) {
  const tone = iconTone === "orange" ? "bg-[#fff0dc] text-[#e39b4d]" : "bg-[#f4e8f5] text-[#65096c]";
  return (
    <section className="rounded-[12px] border border-[#eee5ef] bg-white p-5 shadow-[0_8px_22px_rgba(45,20,50,0.06)]">
      <div className="mb-5 flex items-center gap-2">
        <span className={`flex size-7 items-center justify-center rounded-[7px] ${tone}`}>
          <Icon className="size-3.5" />
        </span>
        <h2 className="text-[13px] font-black text-[#65096c]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function CreateUser({ userId = null, showBusinessHeader = false }: any) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [roles, setRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(Boolean(userId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [adminProfile, setAdminProfile] = useState({ name: "Admin", photo: "" });
  const isEditing = Boolean(userId);

  useEffect(() => {
    if (!showBusinessHeader) return;

    const sessionUser = getAuthSession()?.user;
    if (sessionUser) {
      setAdminProfile({
        name: sessionUser.full_name || sessionUser.username || "Admin",
        photo: sessionUser.photo || "",
      });
    }

    api.get("/accounts/me/")
      .then(({ data }) => {
        setAdminProfile({
          name: data.name || data.full_name || data.email || "Admin",
          photo: data.photo_url || "",
        });
      })
      .catch(() => {});
  }, [showBusinessHeader]);

  useEffect(() => {
    let mounted = true;
    api.get("/accounts/roles/")
      .then(({ data }) => {
        if (!mounted) return;
        const roleList = Array.isArray(data) ? data : data.results || [];
        setRoles(roleList.filter((role) => role.role_status !== false));
      })
      .catch(() => {
        if (mounted) setError("Unable to load roles. Please create a role first.");
      })
      .finally(() => {
        if (mounted) setIsLoadingRoles(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    setIsLoadingUser(true);
    api.get(`/accounts/admin-users/${userId}/`)
      .then(({ data }) => {
        if (!mounted) return;
        const selectedRole = data.role === "ADMIN"
          ? "ADMIN"
          : data.role === "BUSINESS"
            ? "BUSINESS"
            : data.role_obj?.id
              ? `ROLE:${data.role_obj.id}`
              : "";
        setForm({
          full_name: data.full_name || "",
          email: data.email || "",
          username: data.username || "",
          user_role: selectedRole,
          location: data.location || "",
          language: data.language || "",
          phone: data.phone || "",
          password: "",
          confirm_password: "",
          is_active: data.is_active ? "true" : "false",
        });
        setPreviewUrl(data.photo_url || "");
      })
      .catch(() => setError("Unable to load this user."))
      .finally(() => {
        if (mounted) setIsLoadingUser(false);
      });
    return () => { mounted = false; };
  }, [userId]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const setSelectedPhoto = (file) => {
    setError("");
    if (!file) {
      setPhoto(null);
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PNG, JPG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be 5MB or less.");
      return;
    }

    setPhoto(file);
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handlePhotoChange = (event) => {
    setSelectedPhoto(event.target.files?.[0] || null);
  };

  const handlePhotoDrop = (event) => {
    event.preventDefault();
    setIsDraggingPhoto(false);
    setSelectedPhoto(event.dataTransfer.files?.[0] || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Password and confirm password do not match.");
      return;
    }
    if (!isEditing && !form.password) {
      setError("Password is required.");
      return;
    }
    if (form.user_role === "BUSINESS" && !form.location.trim()) {
      setError("Location is required for business users.");
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (isEditing && (key === "password" || key === "confirm_password") && !value) return;
      if (key === "location" && form.user_role !== "BUSINESS") return;
      if (key === "language" && form.user_role !== "BUSINESS") return;
      payload.append(key, value);
    });
    if (photo) payload.append("photo", photo);

    setIsSubmitting(true);
    try {
      const url = isEditing ? `/accounts/admin-users/${userId}/` : "/accounts/admin-users/";
      const method = isEditing ? "patch" : "post";
      await api[method](url, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/admin/users");
    } catch (caughtError) {
      setError(getApiError(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const basicDone = Boolean(form.full_name && form.email && form.username && form.user_role);
  const contactDone = Boolean(form.phone && (form.user_role !== "BUSINESS" || form.location));
  const accountDone = Boolean(form.is_active && (isEditing || (form.password && form.confirm_password)));
  const profileDone = Boolean(photo || previewUrl);
  const completedItems = [basicDone, contactDone, accountDone, profileDone].filter(Boolean).length;
  const completion = completedItems * 25;

  return (
    <section className="min-h-screen w-full bg-[#f6eff7] pb-10">
      {showBusinessHeader ? (
        <header className="flex min-h-[70px] flex-wrap items-center justify-between gap-4 border-b border-[#eadfec] bg-white px-6 py-3 sm:px-8">
          <div className="min-w-0">
            <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#9aa1ad]">
              <button
                className="transition hover:text-[#65096c]"
                onClick={() => router.push("/admin/users")}
                type="button"
              >
                User
              </button>
              <ChevronRight className="size-3 text-[#c0c4cb]" />
              <span className="font-bold text-[#65096c]">{isEditing ? "Edit User" : "Add User"}</span>
            </div>
            <h1 className="text-[17px] font-black leading-tight text-[#65096c]">{isEditing ? "Edit User" : "Add User"}</h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <label className="relative hidden w-[182px] sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
              <input
                className="h-[38px] w-full rounded-xl border border-[#e7e9ed] bg-[#fafbfc] pl-9 pr-3 text-xs text-[#4b5563] outline-none placeholder:text-[#9ca3af] focus:border-[#65096c]/40 focus:ring-2 focus:ring-[#65096c]/10"
                placeholder="Search..."
                type="search"
              />
            </label>
            <NotificationMenu
              buttonClassName="relative flex size-[38px] items-center justify-center rounded-xl border border-[#e7e9ed] bg-[#fafbfc] text-[#65096c] transition hover:bg-[#f5eef6]"
              iconClassName="size-4"
            />
            <button
              aria-label="Open admin profile"
              className="flex size-[38px] shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#e39b4d] bg-[#65096c] text-xs font-black text-white transition hover:scale-105"
              onClick={() => router.push("/admin/settings")}
              type="button"
            >
              {adminProfile.photo ? (
                <img alt={adminProfile.name} className="h-full w-full object-cover" src={adminProfile.photo} />
              ) : (
                adminProfile.name.trim().charAt(0).toUpperCase() || "A"
              )}
            </button>
          </div>
        </header>
      ) : null}

      <div className="border-b border-[#eadfec] bg-[#fbf8fc] px-6 py-3">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[13px] font-black text-[#65096c]">
              <UsersRound className="size-4" />
              <span>User Registration</span>
            </div>
            <span className="hidden h-px w-5 bg-[#bcaec2] sm:block" />
            <p className="text-[12px] font-medium text-[#aaa1b0]">Fill in the details below to add a new business to the platform</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#fff0d9] px-4 py-1.5 text-[11px] font-bold text-[#e39b4d]">
            <CheckCircle2 className="size-3.5" />
            All fields marked * are required
          </div>
        </div>
      </div>

      <form className={`mx-auto grid w-full gap-7 px-6 pt-6 ${showBusinessHeader ? "max-w-[1240px] lg:grid-cols-[minmax(0,1fr)_390px]" : "max-w-[1120px] lg:grid-cols-[minmax(0,1fr)_300px]"}`} onSubmit={handleSubmit}>
        <div className="space-y-5">
          {error ? (
            <div className="rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-[12px] font-bold text-red-700">
              {error}
            </div>
          ) : null}

          {isLoadingUser ? (
            <div className="rounded-[8px] border border-[#efe6f1] bg-[#fffaff] px-4 py-5 text-sm font-bold text-[#65096c]">
              Loading user details...
            </div>
          ) : null}

          <SectionCard icon={UsersRound} title="Basic Information">
            <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">
              <TextField icon={User} label="Full Name" name="full_name" onChange={handleChange} placeholder="Full Name" value={form.full_name} />
              <TextField icon={User} label="User Name" name="username" onChange={handleChange} placeholder="User Name" value={form.username} />
              <TextField icon={Mail} label="Email Address" name="email" onChange={handleChange} placeholder="contact@business.com" type="email" value={form.email} />
              <SelectField disabled={isLoadingRoles} label="User Role" name="user_role" onChange={handleChange} value={form.user_role}>
                <option value="">{isLoadingRoles ? "Loading roles..." : "Choose User Role"}</option>
                <option value="ADMIN">Admin</option>
                <option value="BUSINESS">Bussiness user</option>
                {roles.map((role) => (
                  <option key={role.id} value={`ROLE:${role.id}`}>{role.role_name}</option>
                ))}
              </SelectField>
            </div>
          </SectionCard>

          <SectionCard icon={BriefcaseBusiness} iconTone="orange" title="Contact Information">
            <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">
              {form.user_role === "BUSINESS" ? (
                <>
                  <TextField icon={MapPin} label="Location" name="location" onChange={handleChange} placeholder="e.g. Riyadh, Saudi Arabia" value={form.location} />
                  {isEditing ? (
                    <TextField icon={Languages} label="Language" name="language" onChange={handleChange} placeholder="e.g. English (EN)" required={false} value={form.language} />
                  ) : (
                    <SelectField label="Language" name="language" onChange={handleChange} value={form.language}>
                      <option value="English (EN)">English</option>
                      <option value="Arabic (AR)">Arabic</option>
                    </SelectField>
                  )}
                </>
              ) : null}
              <TextField icon={Phone} label="Phone Number" name="phone" onChange={handleChange} placeholder="+966 5X XXX XXXX" type="tel" value={form.phone} />
            </div>
          </SectionCard>

          <SectionCard icon={ClipboardList} title="Account Setup">
            <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">
              <PasswordField label={isEditing ? "New Password" : "Password"} name="password" onChange={handleChange} placeholder="************" required={!isEditing} value={form.password} />
              <PasswordField label="Confirm Password" name="confirm_password" onChange={handleChange} placeholder="Confirm Password" required={!isEditing} value={form.confirm_password} />
              <div className="md:col-span-2">
                <SelectField label="User Status" name="is_active" onChange={handleChange} value={form.is_active}>
                  <option value="">Select status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </SelectField>
              </div>
            </div>
          </SectionCard>

          <div className="flex items-center justify-between pt-1">
            <button className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#e39b4d] bg-white px-5 text-[12px] font-bold text-[#e39b4d] transition hover:bg-[#fff7ef]" onClick={() => router.push("/admin/users")} type="button">
              <X className="size-3.5" />
              Cancel
            </button>
            <button className="inline-flex h-10 items-center gap-3 rounded-[9px] bg-[#e39b4d] px-9 text-[12px] font-bold text-white shadow-[0_12px_22px_rgba(227,155,77,0.28)] transition hover:bg-[#d88c39] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting || isLoadingRoles} type="submit">
              <Check className="size-3.5" />
              {isSubmitting ? "Saving..." : isEditing ? "Update User" : "Save User"}
            </button>
          </div>
        </div>

        <aside className="space-y-5">
          <section className={`border border-[#eee5ef] bg-white shadow-[0_8px_22px_rgba(45,20,50,0.06)] ${showBusinessHeader ? "rounded-[20px] p-7" : "rounded-[12px] p-5"}`}>
            <div className={`flex items-center ${showBusinessHeader ? "mb-5 gap-3" : "mb-4 gap-2"}`}>
              <span className={`flex items-center justify-center bg-[#f1e7f2] text-[#65096c] ${showBusinessHeader ? "size-9 rounded-[10px]" : "size-7 rounded-[7px]"}`}>
                <ImageIcon className={showBusinessHeader ? "size-4" : "size-3.5"} />
              </span>
              <h2 className={`font-black text-[#65096c] ${showBusinessHeader ? "text-[17px]" : "text-[13px]"}`}>Profile photo</h2>
            </div>
            <input accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handlePhotoChange} ref={fileInputRef} type="file" />
            <button
              className={`flex w-full flex-col items-center justify-center border-dashed text-center transition ${showBusinessHeader ? "min-h-[315px] rounded-[16px] border-2 px-6 py-8" : "min-h-[190px] rounded-[10px] border px-5 py-6"} ${isDraggingPhoto ? "border-[#65096c] bg-[#fff7ff]" : "border-[#d6afd9] bg-[#fffbff]"}`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(event) => { event.preventDefault(); setIsDraggingPhoto(true); }}
              onDragOver={(event) => { event.preventDefault(); setIsDraggingPhoto(true); }}
              onDragLeave={(event) => { event.preventDefault(); setIsDraggingPhoto(false); }}
              onDrop={handlePhotoDrop}
              type="button"
            >
              {previewUrl ? (
                <img alt="Selected profile" className={`${showBusinessHeader ? "mb-5 size-[72px]" : "mb-3 size-16"} rounded-full object-cover`} src={previewUrl} />
              ) : (
                <span className={`flex items-center justify-center rounded-full bg-[#f1e7f2] text-[#65096c] ${showBusinessHeader ? "mb-5 size-[72px]" : "mb-4 size-14"}`}>
                  <CloudUpload className={`${showBusinessHeader ? "size-9" : "size-7"} fill-[#65096c]`} />
                </span>
              )}
              <span className={`font-black text-[#65096c] ${showBusinessHeader ? "text-[18px]" : "text-[13px]"}`}>{showBusinessHeader ? "Upload Photo" : "Upload Logo"}</span>
              <span className={`mt-2 font-medium text-[#9da5b5] ${showBusinessHeader ? "text-[15px] leading-6" : "text-[11px] leading-4"}`}>Drag &amp; drop or click to browse<br />PNG, JPG up to 5MB</span>
              <span className={`bg-[#65096c] font-black text-white ${showBusinessHeader ? "mt-5 rounded-[10px] px-6 py-2.5 text-[13px]" : "mt-4 rounded-[7px] px-5 py-2 text-[11px]"}`}>Browse Files</span>
            </button>
          </section>

          <section className="rounded-[12px] border border-[#eee5ef] bg-white p-5 shadow-[0_8px_22px_rgba(45,20,50,0.06)]">
            <div className="mb-5 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-[7px] bg-[#fff0dc] text-[#e39b4d]">
                <ClipboardList className="size-3.5" />
              </span>
              <h2 className="text-[13px] font-black text-[#65096c]">Completion Checklist</h2>
            </div>
            <div className="space-y-4">
              {[
                ["Basic information filled", basicDone],
                ["Contact Information", contactDone],
                ["Account Setup", accountDone],
                ["Profile uploaded", profileDone],
              ].map(([label, done]) => (
                <div className="flex items-center gap-3 text-[11px] font-medium" key={label}>
                  <span className={`flex size-4 items-center justify-center rounded-full ${done ? "bg-[#dcf8e8] text-[#21ba72]" : "bg-[#eaddec] text-[#d4b8d7]"}`}>
                    {done ? <Check className="size-3" /> : null}
                  </span>
                  <span className={done ? "text-[#55515d]" : "text-[#aaa1b0]"}>{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-[11px] font-black">
                <span className="text-[#65096c]">Profile Completion</span>
                <span className="text-[#e39b4d]">{completion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#eaddec]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#65096c] to-[#e39b4d]" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </section>
        </aside>
      </form>
    </section>
  );
}
