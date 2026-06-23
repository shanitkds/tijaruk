"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck, X } from "lucide-react";
import api from "../../api/axios";
import { dashboardToast } from "../admin/AdminToast";

type PasswordField = "current_password" | "new_password" | "confirm_password";
type FieldErrors = Partial<Record<PasswordField, string>>;

function readErrors(caughtError: unknown): FieldErrors & { general?: string } {
  if (!caughtError || typeof caughtError !== "object" || !("response" in caughtError)) {
    return { general: "Unable to change your password. Please try again." };
  }
  const data = (caughtError as { response?: { data?: Record<string, string | string[]> } }).response?.data;
  if (!data) return { general: "Unable to change your password. Please try again." };

  const result: FieldErrors & { general?: string } = {};
  for (const field of ["current_password", "new_password", "confirm_password"] as PasswordField[]) {
    const value = data[field];
    if (value) result[field] = Array.isArray(value) ? value[0] : value;
  }
  const general = data.non_field_errors || data.detail || data.error;
  if (general) result.general = Array.isArray(general) ? general[0] : general;
  return Object.keys(result).length ? result : { general: "Unable to change your password. Please try again." };
}

function PasswordInput({
  autoFocus,
  error,
  label,
  name,
  onChange,
  placeholder,
  value,
}: {
  autoFocus?: boolean;
  error?: string;
  label: string;
  name: PasswordField;
  onChange: (name: PasswordField, value: string) => void;
  placeholder: string;
  value: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#374151] sm:text-sm">{label}</span>
      <span className="relative block">
        <LockKeyhole className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
        <input
          aria-invalid={Boolean(error)}
          autoComplete={name === "current_password" ? "current-password" : "new-password"}
          autoFocus={autoFocus}
          className={`h-11 w-full rounded-xl border bg-white pl-10 pr-11 text-sm text-[#111827] outline-none transition sm:h-12 ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-[#d1d5db] focus:border-[#65096c] focus:ring-2 focus:ring-[#65096c]/10"
          }`}
          name={name}
          onChange={(event) => onChange(name, event.target.value)}
          placeholder={placeholder}
          required
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#65096c]"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </span>
    </label>
  );
}

export default function PasswordChangeModal({
  onChanged,
  onClose,
  open,
}: {
  onChanged: () => void;
  onClose: () => void;
  open: boolean;
}) {
  const [values, setValues] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [errors, setErrors] = useState<FieldErrors & { general?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues({ current_password: "", new_password: "", confirm_password: "" });
    setErrors({});
    setCompleted(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose, open]);

  if (!open) return null;

  const requirements = [
    [values.new_password.length >= 8, "At least 8 characters"],
    [/[A-Z]/.test(values.new_password), "One uppercase letter"],
    [/[a-z]/.test(values.new_password), "One lowercase letter"],
    [/\d/.test(values.new_password), "One number"],
  ] as const;

  function updateValue(name: PasswordField, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, general: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (values.new_password !== values.confirm_password) {
      setErrors({ confirm_password: "The new passwords do not match." });
      dashboardToast.error("Passwords do not match", "Enter the same new password in both fields.");
      return;
    }
    setErrors({});
    setIsSaving(true);
    try {
      await api.post("/accounts/change-password/", values);
      onChanged();
      dashboardToast.success("Password updated", "Use your new password the next time you sign in.");
      onClose();
    } catch (caughtError) {
      const nextErrors = readErrors(caughtError);
      setErrors(nextErrors);
      dashboardToast.error(
        "Unable to change password",
        nextErrors.current_password || nextErrors.new_password || nextErrors.confirm_password || nextErrors.general,
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      aria-labelledby="change-password-title"
      aria-modal="true"
      className="fixed inset-0 z-[1500] flex items-center justify-center overflow-y-auto bg-[#111827]/55 px-4 py-5 backdrop-blur-[2px] sm:px-6 sm:py-8 md:px-8 lg:px-10 xl:px-12"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
      role="dialog"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_24px_80px_rgba(17,24,39,0.3)] sm:max-w-lg sm:rounded-3xl sm:p-6 md:p-7 lg:max-w-xl lg:p-8">
        <button
          aria-label="Close password dialog"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#65096c] disabled:opacity-50 sm:right-5 sm:top-5"
          disabled={isSaving}
          onClick={onClose}
          type="button"
        >
          <X className="size-4 sm:size-5" />
        </button>

        {completed ? (
          <div className="py-5 text-center sm:py-8">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]">
              <CheckCircle2 className="size-8" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-[#111827] sm:text-2xl" id="change-password-title">
              Password updated
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#6b7280] sm:text-sm sm:leading-6">
              Your password has been changed successfully. Use your new password the next time you sign in.
            </p>
            <button
              className="mt-6 h-11 w-full rounded-xl bg-[#65096c] px-6 text-sm font-semibold text-white transition hover:bg-[#500957] sm:w-auto"
              onClick={onClose}
              type="button"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f3e8f4] text-[#65096c] sm:size-14">
              <KeyRound className="size-6 sm:size-7" />
            </span>
            <h2 className="mt-4 pr-10 text-lg font-bold text-[#111827] sm:text-xl md:text-2xl" id="change-password-title">
              Change your password
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-[#6b7280] sm:text-sm">
              Use a strong password you do not use anywhere else.
            </p>

            <form className="mt-5 space-y-4 sm:mt-6" onSubmit={submit}>
              <PasswordInput
                autoFocus
                error={errors.current_password}
                label="Current password"
                name="current_password"
                onChange={updateValue}
                placeholder="Enter your current password"
                value={values.current_password}
              />
              <PasswordInput
                error={errors.new_password}
                label="New password"
                name="new_password"
                onChange={updateValue}
                placeholder="Create a new password"
                value={values.new_password}
              />

              <div className="grid grid-cols-1 gap-1.5 rounded-xl bg-[#f9fafb] p-3 sm:grid-cols-2 sm:gap-x-4">
                {requirements.map(([met, label]) => (
                  <span className={`flex items-center gap-1.5 text-[10px] ${met ? "text-[#059669]" : "text-[#9ca3af]"}`} key={label}>
                    <Check className="size-3" />
                    {label}
                  </span>
                ))}
              </div>

              <PasswordInput
                error={errors.confirm_password}
                label="Confirm new password"
                name="confirm_password"
                onChange={updateValue}
                placeholder="Enter the new password again"
                value={values.confirm_password}
              />

              <div className="flex items-start gap-2 rounded-xl border border-[#e9d5ec] bg-[#faf5fb] p-3 text-[10px] leading-4 text-[#6b7280] sm:text-xs sm:leading-5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#65096c]" />
                You will use the new password for all future Tijaruk sign-ins.
              </div>

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                <button
                  className="h-11 w-full rounded-xl border border-[#d1d5db] px-5 text-sm font-semibold text-[#4b5563] hover:bg-[#f9fafb] disabled:opacity-50 sm:w-auto"
                  disabled={isSaving}
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="h-11 w-full rounded-xl bg-[#65096c] px-5 text-sm font-semibold text-white transition hover:bg-[#500957] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  disabled={isSaving || requirements.some(([met]) => !met)}
                  type="submit"
                >
                  {isSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
