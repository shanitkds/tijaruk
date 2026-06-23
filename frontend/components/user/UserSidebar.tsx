"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import api from "../../api/axios";
import { getAuthSession, type AuthUser } from "../../lib/auth";
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  Home,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Package,
  Plus,
  Settings,
} from "lucide-react";

type ProfileResponse = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  photo_url: string;
};

const menuItems = [
  {
    label: "Dashboard",
    href: "/user",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "My RFQs",
    href: "/user/rfqs",
    icon: Inbox,
    children: [
      { label: "All RFQs", href: "/user/rfqs", icon: Home },
      { label: "New RFQ", href: "/user/rfqs/new", icon: Plus },
    ],
  },
  {
    label: "Products",
    href: "/user/products",
    icon: Package,
    expandable: true,
  },
  {
    label: "Messages",
    href: "/user/messages",
    icon: MessageSquare,
    count: 0,
  },
];

const generalItems = [
  { label: "Profile", href: "/user/profile", icon: CircleUserRound },
  { label: "Settings", href: "/user/settings", icon: Settings },
];

function isActive(pathname: string | null, href: string, exact = false) {
  if (!pathname) {
    return false;
  }

  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <p className="px-4 text-[10px] font-semibold uppercase leading-[15px] tracking-[1px] text-white/40">
        {title}
      </p>
      <nav className="space-y-1">{children}</nav>
    </section>
  );
}

export default function UserSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [msgUnread, setMsgUnread] = useState(0);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    api.get<any[]>("/messages/conversations/")
      .then(({ data }) => {
        const total = data.reduce((sum: number, c: any) => sum + (c.support_unread_count || 0), 0);
        setMsgUnread(total);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCurrentUser(getAuthSession()?.user || null);

    api.get<ProfileResponse>("/accounts/me/")
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
        // Keep the stored login identity when the profile refresh is unavailable.
      });
  }, []);

  const displayName = currentUser?.full_name || currentUser?.username || "User";
  const displayEmail = currentUser?.email || "";
  const userInitial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col bg-[#65096c] text-white">
      <div className="flex h-full flex-col px-4 py-6">
        <Link className="mb-9 flex items-center gap-3 px-1" href="/user" onClick={onNavigate}>
          <span className="flex size-7 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold">
            ti
          </span>
          <span className="text-sm font-bold tracking-wide">TIJARUK</span>
        </Link>

        <div className="flex flex-1 flex-col gap-7">
          <NavSection title="Menu">
            {menuItems.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              const Icon = item.icon;

              const expanded = Boolean(item.children && (active || openMenu === item.label));

              return (
                <div
                  key={item.label}
                  className={item.children ? "space-y-1" : ""}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setOpenMenu((current) => (current === item.label ? null : current));
                    }
                  }}
                  onFocus={() => item.children && setOpenMenu(item.label)}
                  onMouseEnter={() => item.children && setOpenMenu(item.label)}
                  onMouseLeave={() => item.children && !active && setOpenMenu(null)}
                >
                  <Link
                    className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                      active
                        ? "bg-white/10 font-semibold text-white"
                        : "font-medium text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                    href={item.href}
                    onClick={onNavigate}
                  >
                    {active ? (
                      <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#e39b4d]" />
                    ) : null}
                    <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.8} />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.expandable || item.children ? (
                      item.children ? (
                        <button
                          aria-expanded={expanded}
                          aria-label={`${expanded ? "Hide" : "Show"} ${item.label} links`}
                          className="-mr-2 flex size-7 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setOpenMenu((current) =>
                              current === item.label && !active ? null : item.label,
                            );
                          }}
                          type="button"
                        >
                          <ChevronDown
                            aria-hidden="true"
                            className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`}
                            strokeWidth={2}
                          />
                        </button>
                      ) : (
                        <ChevronDown
                          aria-hidden="true"
                          className={`size-3 shrink-0 ${active ? "text-white/60" : "text-white/30"}`}
                          strokeWidth={2}
                        />
                      )
                    ) : null}
                    {item.label === "Messages" ? (
                      !active && msgUnread > 0 ? (
                        <span className="flex h-[19px] min-w-[23px] items-center justify-center rounded-full bg-[#e39b4d] px-2 text-[10px] font-bold leading-[15px] text-white">
                          {msgUnread}
                        </span>
                      ) : null
                    ) : item.count ? (
                      <span className="flex h-[19px] min-w-[23px] items-center justify-center rounded-full bg-[#e39b4d] px-2 text-[10px] font-bold leading-[15px] text-white">
                        {item.count}
                      </span>
                    ) : null}
                  </Link>

                  {item.children && expanded ? (
                    <div className="ml-7 w-[212px] space-y-0.5">
                      {item.children.map((child) => {
                        const childActive = isActive(pathname, child.href, true);
                        const ChildIcon = child.icon;
                        const childClassName = `flex min-h-8 items-center gap-3 rounded-xl px-4 py-2 text-xs transition ${
                          childActive
                            ? "bg-[#e39b4d]/20 font-semibold text-[#e39b4d]"
                            : "font-medium text-white/50 hover:bg-white/5 hover:text-white/75"
                        }`;

                        if (child.label === "New RFQ") {
                          return (
                            <div className={childClassName} key={child.label}>
                              <ChildIcon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.8} />
                              <span className="truncate">{child.label}</span>
                            </div>
                          );
                        }

                        return (
                          <Link
                            className={childClassName}
                            href={child.href}
                            key={child.label}
                            onClick={onNavigate}
                          >
                            <ChildIcon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.8} />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </NavSection>

          <NavSection title="General">
            {generalItems.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-white/10 font-semibold text-white"
                      : "font-medium text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                  href={item.href}
                  key={item.label}
                  onClick={onNavigate}
                >
                  <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.8} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </NavSection>
        </div>

        <div className="mt-8 flex items-center gap-3 px-1">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-sm font-bold text-white ring-2 ring-white/15">
            {currentUser?.photo ? (
              <img
                alt={`${displayName} profile`}
                className="size-full object-cover"
                src={currentUser.photo}
              />
            ) : (
              userInitial
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-5 text-white">{displayName}</p>
            <p className="truncate text-xs font-medium leading-4 text-white/40">
              {displayEmail}
            </p>
          </div>
          <Bell aria-hidden="true" className="ml-auto size-4 text-white/40" strokeWidth={1.8} />
        </div>
      </div>
    </aside>
  );
}
