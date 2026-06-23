"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type AdminToastType = "success" | "error" | "info";
type AdminToastPayload = {
  type: AdminToastType;
  title: string;
  message?: string;
};

const ADMIN_TOAST_EVENT = "tijaruk-admin-toast";

export function showAdminToast(payload: AdminToastPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ADMIN_TOAST_EVENT, { detail: payload }));
}

export const adminToast = {
  success: (title: string, message?: string) =>
    showAdminToast({ type: "success", title, message }),
  error: (title: string, message?: string) =>
    showAdminToast({ type: "error", title, message }),
  info: (title: string, message?: string) =>
    showAdminToast({ type: "info", title, message }),
};

export const dashboardToast = adminToast;

type ToastItem = AdminToastPayload & { id: number };

export default function AdminToastViewport() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function receiveToast(event: Event) {
      const detail = (event as CustomEvent<AdminToastPayload>).detail;
      const id = Date.now() + Math.random();
      setToasts((current) => [...current.slice(-3), { ...detail, id }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 4500);
    }
    window.addEventListener(ADMIN_TOAST_EVENT, receiveToast);
    return () => window.removeEventListener(ADMIN_TOAST_EVENT, receiveToast);
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-[3000] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
    >
      {toasts.map((toast) => {
        const success = toast.type === "success";
        const error = toast.type === "error";
        const Icon = success ? CheckCircle2 : error ? AlertTriangle : Info;
        return (
          <div
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-[0_18px_55px_rgba(31,17,35,0.2)] ${
              success ? "border-emerald-200" : error ? "border-rose-200" : "border-blue-200"
            }`}
            key={toast.id}
            role={error ? "alert" : "status"}
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                success
                  ? "bg-emerald-50 text-emerald-600"
                  : error
                    ? "bg-rose-50 text-rose-600"
                    : "bg-blue-50 text-blue-600"
              }`}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-[#1f2937]">{toast.title}</p>
              {toast.message ? (
                <p className="mt-0.5 text-xs font-medium leading-5 text-[#6b7280]">
                  {toast.message}
                </p>
              ) : null}
            </div>
            <button
              aria-label="Dismiss notification"
              className="rounded-lg p-1 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#4b5563]"
              onClick={() =>
                setToasts((current) => current.filter((item) => item.id !== toast.id))
              }
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
