// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleUserRound, LayoutDashboard, LogOut, UserPlus } from "lucide-react";
import api from "../../api/axios";
import {
  AUTH_CHANGED_EVENT,
  clearAuthSession,
  getAuthSession,
} from "../../lib/auth";
import BecomeBusinessUserModal from "./BecomeBusinessUserModal";
import { assets, navItems } from "../data";
import { UserIcon } from "../ui";

export default function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isBecomeUserModalOpen, setIsBecomeUserModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountHref, setAccountHref] = useState("/login");
  const [currentUser, setCurrentUser] = useState(null);
  const accountMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const isContactPage = normalizedPath === "/contact";

  const isActiveLink = (href) => {
    if (href === "/") {
      return normalizedPath === "/";
    }

    return normalizedPath === href || normalizedPath.startsWith(`${href}/`);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const closeAccountMenu = () => setIsAccountMenuOpen(false);

  useEffect(() => {
    setIsMounted(true);
    const updateAuthState = () => {
      const session = getAuthSession();
      setIsLoggedIn(Boolean(session));
      setCurrentUser(session?.user || null);
      if (session?.user?.role === "ADMIN" || session?.user?.role === "INTERNAL_STAFF") {
        setAccountHref("/admin");
      } else if (session?.user?.role === "BUSINESS" && session.user.role_type !== "GUEST") {
        setAccountHref("/user");
      } else {
        setAccountHref("/");
      }
    };

    updateAuthState();
    window.addEventListener(AUTH_CHANGED_EVENT, updateAuthState);
    window.addEventListener("storage", updateAuthState);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, updateAuthState);
      window.removeEventListener("storage", updateAuthState);
    };
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setIsAccountMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    const prefetchTargets = new Set(navItems.map((item) => item.href));
    prefetchTargets.add("/contact");

    prefetchTargets.forEach((href) => {
      router.prefetch(href);
    });
  }, [router]);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await api.post("/accounts/logout/", undefined, { skipAuthRedirect: true });
    } finally {
      clearAuthSession();
      setIsAccountMenuOpen(false);
      setIsLoggingOut(false);
    }
  }

  const displayName =
    currentUser?.full_name || currentUser?.username || currentUser?.email || "User";
  const displayEmail = currentUser?.email || "";
  const displayInitial = displayName.trim().charAt(0).toUpperCase() || "U";
  const canOpenDashboard =
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "INTERNAL_STAFF" ||
    (currentUser?.role === "BUSINESS" && currentUser?.role_type !== "GUEST");
  const canBecomeUser =
    currentUser?.role === "BUSINESS" && currentUser?.role_type === "GUEST";
  const profileHref = canBecomeUser ? "/profile" : "/user/profile";

  const navbar = (
    <div className="fixed left-0 right-0 top-2 z-[1000] mx-auto w-full max-w-[1200px] px-3 py-1 sm:px-5 lg:px-4 xl:px-10">
      <div className="flex items-center gap-3">
        <header className="relative z-[1000] w-full rounded-[6px] bg-[#5f0c66] px-3 py-1 shadow-[0_16px_45px_rgba(0,0,0,0.18)] sm:px-4 lg:px-4 xl:px-7">
          <div className="flex items-center justify-between gap-2 xl:gap-4">
            <div className="shrink-0">
              <Link href="/" prefetch onClick={closeMenu}>
                <img
                  alt="Tijaruk"
                  className="h-9 max-w-[68px] object-contain sm:h-10 sm:max-w-[80px] xl:max-w-[84px]"
                  loading="lazy"
                  src={assets.logo}
                />
              </Link>
            </div>

            <nav className="hidden flex-1 items-center justify-center gap-x-6 gap-y-3 font-['Poppins',sans-serif] text-sm font-medium text-white/90 sm:text-base lg:flex lg:gap-x-4 lg:text-[13px] xl:gap-x-8 xl:text-base">
              {navItems.map((item) => {
                const isActive = isActiveLink(item.href);

                return (
                  <Link
                    key={item.label}
                    className="group relative inline-flex h-8 items-center justify-center whitespace-nowrap leading-none text-white/90 transition hover:text-white"
                    href={item.href}
                    prefetch
                    onClick={closeMenu}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-[#e39b4d] transition-all duration-300 ease-out ${
                        isActive ? "w-11" : "w-0 group-hover:w-11"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="hidden shrink-0 items-center gap-3 lg:flex">
              <Link
                className={`inline-flex h-8 items-center justify-center rounded-[5px] px-3 xl:px-4 font-['Poppins',sans-serif] text-sm font-semibold leading-none transition ${
                  isContactPage
                    ? "bg-[#f5d4a8] text-[#5f0c66]"
                    : "bg-white text-[#5f0c66] hover:bg-[#f5d4a8]"
                }`}
                href="/contact"
                prefetch
                onClick={closeMenu}
              >
                Contact Us
              </Link>
            </div>

            <button
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation-menu"
              aria-label="Toggle navigation menu"
              className="inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-[5px] text-white transition hover:bg-white/10 lg:hidden"
              type="button"
              onClick={() => setIsMenuOpen((value) => !value)}
            >
              <span
                className={`h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`h-0.5 w-5 rounded-full bg-current transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isMenuOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
                }`}
              />
              <span
                className={`h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </button>
          </div>

          <div
            aria-hidden={!isMenuOpen}
            className={`grid overflow-hidden border-white/10 transition-[grid-template-rows,opacity,padding-top,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
              isMenuOpen
                ? "grid-rows-[1fr] border-t pt-3 opacity-100"
                : "pointer-events-none grid-rows-[0fr] border-t border-transparent pt-0 opacity-0"
            }`}
            id="mobile-navigation-menu"
          >
            <div className="min-h-0 overflow-hidden">
              <nav
                className={`flex flex-col gap-2 font-['Poppins',sans-serif] text-sm font-medium text-white/90 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isMenuOpen ? "translate-y-0 opacity-100 delay-75" : "-translate-y-2 opacity-0"
                }`}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    className="rounded-[5px] px-2 py-2 text-white/90 transition hover:bg-white/10 hover:text-white"
                    href={item.href}
                    prefetch
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  className="mt-2 inline-flex h-10 items-center justify-center rounded-[5px] bg-white px-4 font-['Poppins',sans-serif] text-sm font-semibold leading-none text-[#5f0c66] transition hover:bg-[#f5d4a8]"
                  href="/contact"
                  prefetch
                  onClick={closeMenu}
                >
                  Contact Us
                </Link>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-[5px] border border-white/30 px-4 font-['Poppins',sans-serif] text-sm font-semibold leading-none text-white transition hover:bg-white/10"
                  href={isLoggedIn ? accountHref : "/login"}
                  onClick={closeMenu}
                >
                  {isLoggedIn ? "My Account" : "Login"}
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {isLoggedIn ? (
          <div className="relative hidden sm:block" ref={accountMenuRef}>
            <button
              aria-expanded={isAccountMenuOpen}
              aria-label="Open your account menu"
              className="flex size-10 shrink-0 items-center justify-center xl:size-11 rounded-full bg-[#5f0c66] text-white ring-1 ring-white/15 transition hover:bg-[#500957]"
              onClick={() => setIsAccountMenuOpen((open) => !open)}
              type="button"
            >
              <UserIcon />
            </button>

            {isAccountMenuOpen ? (
              <div className="absolute right-0 top-full z-[1010] mt-3 w-[300px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white font-['Poppins',sans-serif] shadow-[0_18px_50px_rgba(31,17,35,0.18)]">
                <div className="flex items-center gap-3 px-4 py-4">
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f3e8f4] text-lg font-bold text-[#65096c]">
                    {currentUser?.photo ? (
                      <img
                        alt={`${displayName} profile`}
                        className="size-full object-cover"
                        src={currentUser.photo}
                      />
                    ) : (
                      displayInitial
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold leading-5 text-[#020617]">
                      {displayName}
                    </p>
                    <p className="truncate text-sm leading-5 text-[#a1a1aa]">
                      {displayEmail}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#eef0f3] py-2">
                  {canOpenDashboard ? (
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-[#334155] transition hover:bg-[#faf8fa]"
                      onClick={() => {
                        closeAccountMenu();
                        router.push(accountHref);
                      }}
                      type="button"
                    >
                      <LayoutDashboard className="size-5 text-[#64748b]" />
                      Dashboard
                    </button>
                  ) : null}

                  {canBecomeUser ? (
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-[#334155] transition hover:bg-[#faf8fa]"
                      onClick={() => {
                        closeAccountMenu();
                        setIsBecomeUserModalOpen(true);
                      }}
                      type="button"
                    >
                      <UserPlus className="size-5 text-[#64748b]" />
                      Become a user
                    </button>
                  ) : null}

                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-[#334155] transition hover:bg-[#faf8fa]"
                    onClick={() => {
                      closeAccountMenu();
                      router.push(profileHref);
                    }}
                    type="button"
                  >
                    <CircleUserRound className="size-5 text-[#64748b]" />
                    Go to Profile
                  </button>

                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut className="size-5" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <Link
            className="hidden h-10 shrink-0 items-center justify-center rounded-full bg-[#5f0c66] px-4 xl:h-11 xl:px-5 font-['Poppins',sans-serif] text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-[#500957] sm:flex"
            href="/login"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMounted ? createPortal(navbar, document.body) : null}
      {isMounted ? (
        <BecomeBusinessUserModal
          isOpen={isBecomeUserModalOpen}
          onClose={() => setIsBecomeUserModalOpen(false)}
          onSuccess={() => {
            setIsBecomeUserModalOpen(false);
            router.push("/user");
          }}
        />
      ) : null}
      <div aria-hidden="true" className="h-[54px] sm:h-[56px]" />
    </>
  );
}

