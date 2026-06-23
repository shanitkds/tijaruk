"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "../../lib/auth";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminToastViewport, { adminToast } from "../../components/admin/AdminToast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
    } else if (
      session.user.role !== "ADMIN" &&
      session.user.role !== "INTERNAL_STAFF"
    ) {
      router.replace(session.user.role === "BUSINESS" ? "/user" : "/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message?: unknown) => {
      const text = String(message ?? "");
      const isError = /unable|error|failed|invalid|incorrect|mismatch/i.test(text);
      if (isError) adminToast.error("Action failed", text);
      else adminToast.success("Action completed", text);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#f8f7fa] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-[#500c56] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7fa]">
      <AdminToastViewport />
      <AdminSidebar />
      <div className="lg:pl-[265px]">{children}</div>
    </div>
  );
}
