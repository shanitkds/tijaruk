"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import api from "../../api/axios";
import type { BusinessProfileResponse } from "./userDashboardData";
import BusinessProfileSetupModal from "./BusinessProfileSetupModal";
import UserDashboardHeader from "./UserDashboardHeader";
import { UserSearchProvider } from "./UserSearchContext";
import UserSidebar from "./UserSidebar";

export default function UserDashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    if (sidebarOpen) {
      setSidebarMounted(true);
      return;
    }

    const timer = window.setTimeout(() => setSidebarMounted(false), 300);

    return () => window.clearTimeout(timer);
  }, [sidebarOpen]);

  useEffect(() => {
    let mounted = true;

    api
      .get<BusinessProfileResponse>("/business-profile/")
      .then(({ data }) => {
        if (!mounted) return;
        setProfileComplete(
          data.profileComplete ?? Boolean(data.company?.name),
        );
      })
      .catch(() => {
        if (mounted) setProfileComplete(true);
      })
      .finally(() => {
        if (mounted) setProfileChecked(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  function openSidebar() {
    setSidebarMounted(true);
    window.requestAnimationFrame(() => setSidebarOpen(true));
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <UserSearchProvider>
      <div className="flex min-h-screen">
        <div className="fixed left-0 top-0 z-40 hidden lg:block">
          <UserSidebar />
        </div>

        {sidebarMounted ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close navigation"
              className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ease-out ${
                sidebarOpen ? "opacity-100" : "opacity-0"
              }`}
              onClick={closeSidebar}
              type="button"
            />
            <div
              className={`absolute inset-y-0 left-0 w-64 shadow-2xl transition-transform duration-300 ease-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <UserSidebar onNavigate={closeSidebar} />
              <button
                aria-label="Close navigation"
                className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/10 text-white"
                onClick={closeSidebar}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>
        ) : null}

        <main className="flex min-w-0 max-w-full flex-1 flex-col overflow-x-hidden lg:pl-64">
          <UserDashboardHeader onOpenMenu={openSidebar} />
          {children}
        </main>
        {profileChecked && !profileComplete ? (
          <BusinessProfileSetupModal
            onComplete={() => {
              setProfileComplete(true);
              router.replace("/user/products");
            }}
          />
        ) : null}
      </div>
    </UserSearchProvider>
  );
}
