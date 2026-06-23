"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircleUserRound, LogOut, Menu, Plus, Search } from "lucide-react";
import api from "../../api/axios";
import {
  clearAuthSession,
  getAuthSession,
  type AuthUser,
} from "../../lib/auth";
import NotificationMenu from "../notifications/NotificationMenu";
import { useUserSearch } from "./UserSearchContext";

type ProfileResponse = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  photo_url: string;
};

export default function UserDashboardHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { searchQuery, setSearchQuery } = useUserSearch();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const isRfqsPage = pathname === "/user/rfqs";
  const isProductsPage = pathname === "/user/products";
  const isProfilePage = pathname === "/user/profile";
  const isSettingsPage = pathname === "/user/settings";
  const showSearch = isRfqsPage || isProductsPage;

  useEffect(() => {
    setSearchQuery("");
  }, [pathname, setSearchQuery]);

  useEffect(() => {
    const storedUser = getAuthSession()?.user || null;
    setCurrentUser(storedUser);

    api
      .get<ProfileResponse>("/accounts/me/")
      .then(({ data }) => {
        setCurrentUser({
          id: String(data.id),
          full_name: data.name,
          username: data.username,
          email: data.email,
          role: data.role,
          photo: data.photo_url,
        });
      })
      .catch(() => {
        // The stored login identity remains available if profile refresh fails.
      });
  }, []);

  useEffect(() => {
    function closeProfileMenu(event: MouseEvent) {
      if (
        profileMenuRef.current
        && !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, []);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await api.post("/accounts/logout/");
    } finally {
      clearAuthSession();
      router.replace("/login");
    }
  }

  const displayName = currentUser?.full_name || currentUser?.username || "User";
  const usernameInitial = displayName
    .trim()
    .charAt(0)
    .toUpperCase() || "U";

  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Open navigation"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#e5e7eb] text-[#65096c] lg:hidden"
          onClick={onOpenMenu}
          type="button"
        >
          <Menu className="size-5" />
        </button>

        {isProfilePage || isSettingsPage ? (
          <div className="min-w-0 pr-2">
            <p className="text-[10px] font-medium leading-3 text-[#9ca3af]">Account</p>
            <h1 className="truncate text-base font-semibold leading-6 text-[#111827] sm:text-xl">
              {isSettingsPage ? "Account Settings" : "My Profile"}
            </h1>
          </div>
        ) : (
          <h1 className="min-w-0 truncate pr-2 text-base font-semibold leading-7 text-[#111827] sm:text-xl">
            Welcome back, Ahmed
          </h1>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-6">
        {showSearch ? (
          <label className="relative hidden w-[240px] md:block lg:w-[320px]">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-[#6b7280]"
              strokeWidth={2}
            />
            <input
              aria-label={isRfqsPage ? "Search RFQs" : "Search products"}
              className="h-10 w-full rounded-full border border-[#e5e7eb] bg-[#f8f9fa] pl-10 pr-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#d1d5db] focus:bg-white"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={isRfqsPage ? "Search RFQs..." : "Search products..."}
              type="search"
              value={searchQuery}
            />
          </label>
        ) : null}

        <NotificationMenu />

        {isRfqsPage ? (
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#e39b4d] px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d88d3e] sm:px-5 sm:text-sm"
            type="button"
          >
            <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.2} />
            <span className="hidden sm:inline">Request New Product</span>
            <span className="sm:hidden">New Product</span>
          </button>
        ) : null}

        <div className="relative" ref={profileMenuRef}>
          <button
            aria-expanded={profileMenuOpen}
            aria-label={`${displayName} profile menu`}
            className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-[#f3e8f4] text-sm font-bold text-[#65096c] ring-2 ring-white"
            onClick={() => setProfileMenuOpen((open) => !open)}
            type="button"
          >
            {currentUser?.photo ? (
              <img
                alt={`${displayName} profile`}
                className="size-full object-cover"
                src={currentUser.photo}
              />
            ) : (
              usernameInitial
            )}
          </button>

          {profileMenuOpen ? (
            <div className="absolute right-0 top-full z-[110] mt-3 w-[290px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_18px_50px_rgba(31,17,35,0.18)]">
              <div className="flex items-center gap-3 px-5 py-5">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f3e8f4] text-lg font-bold text-[#65096c]">
                  {currentUser?.photo ? (
                    <img
                      alt={`${displayName} profile`}
                      className="size-full object-cover"
                      src={currentUser.photo}
                    />
                  ) : (
                    usernameInitial
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-[#111827]">
                    {displayName}
                  </p>
                  <p className="truncate text-sm text-[#9ca3af]">
                    {currentUser?.email || ""}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#eef0f3] py-2">
                <button
                  className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium text-[#475569] transition hover:bg-[#faf8fa]"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    router.push("/user/profile");
                  }}
                  type="button"
                >
                  <CircleUserRound className="size-4.5 text-[#64748b]" />
                  Go to Profile
                </button>
                <button
                  className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut className="size-4.5" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
