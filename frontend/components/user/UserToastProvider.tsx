"use client";

import { useEffect } from "react";
import AdminToastViewport, { dashboardToast } from "../admin/AdminToast";

export default function UserToastProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message?: unknown) => {
      const text = String(message ?? "");
      const isError = /unable|error|failed|invalid|incorrect|mismatch|required/i.test(text);
      if (isError) dashboardToast.error("Action failed", text);
      else dashboardToast.success("Action completed", text);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  return (
    <>
      <AdminToastViewport />
      {children}
    </>
  );
}
