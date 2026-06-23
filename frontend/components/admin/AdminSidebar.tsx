// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  PieChart,
  FileText,
  Package,
  Building,
  LineChart,
  Users,
  Settings,
  ChevronRight,
  X,
  MessageSquare,
  Menu,
  ShieldCheck,
} from "lucide-react";
import api from "../../api/axios";
import { getAuthSession } from "../../lib/auth";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [pendingRfqCount, setPendingRfqCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    const storedAdmin = getAuthSession()?.user;
    if (storedAdmin) {
      setAdminName(storedAdmin.full_name || storedAdmin.username || "Admin");
      setAdminEmail(storedAdmin.email || "");
      setProfilePhoto(storedAdmin.photo || "");
    }

    api.get("/accounts/me/").then(({ data }) => {
      setAdminName(data.name || data.email || "Admin");
      setAdminEmail(data.email || "");
      setProfilePhoto(data.photo_url || "");
    }).catch(() => {});
  }, []);

  const adminInitial = adminName.trim().charAt(0).toUpperCase() || "A";

  useEffect(() => {
    api.get("/rfqs/").then(({ data }) => {
      setPendingRfqCount(data.filter((r: any) => r.status === "PENDING").length);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/messages/conversations/").then(({ data }) => {
      setUnreadMsgCount(data.reduce((s: number, c: any) => s + (c.unread_count || 0), 0));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => setUnreadMsgCount((prev) => Math.max(0, prev - 1));
    window.addEventListener("admin-conversation-read", handler);
    return () => window.removeEventListener("admin-conversation-read", handler);
  }, []);

  const navLinks = [
    { name: "Dashboard", href: "/admin", icon: PieChart, count: null, segment: "dashboard" },
    { name: "RFQs", href: "/admin/rfqs", icon: FileText, count: pendingRfqCount, segment: "rfqs" },
    { name: "Products", href: "/admin/products", icon: Package, count: null, segment: "products" },
    { name: "Users", href: "/admin/users", icon: Building, count: null, segment: "users" },
    { name: "Reports", href: "/admin/reports", icon: LineChart, count: null, segment: "reports" },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare, count: unreadMsgCount, segment: "messages" },
    { name: "Suppliers", href: "/admin/suppliers", icon: Users, count: null, segment: "suppliers" },
  ];

  const segment = pathname.split("/").filter(Boolean)[1]?.toLowerCase() ?? "dashboard";
  const isAdminRoleActive = segment === "admin-roles";

  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-5 left-4 z-30 p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen min-h-0 flex-col w-[265px] bg-[#500c56] border-r border-[#ffffff]/10 transition-transform duration-300 transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 h-20 border-b border-[#ffffff]/10">
          <div className="h-9 w-[110px] flex items-center">
            <img src="/tijaruk-logo.svg" alt="Tijaruk" className="h-full w-auto object-contain" />
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:bg-white/10 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav data-lenis-prevent className="hide-scrollbar min-h-0 flex-1 overscroll-contain px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = segment === link.segment;
            return (
              <a
                key={link.name}
                href="#"
                onClick={(e) => { e.preventDefault(); navigate(link.href); }}
                className={`relative flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-[#6c1674] text-white font-medium"
                    : "text-[#ecd3ed]/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-6 bg-[#e39b4d] rounded-r-[4px]" />
                )}
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? "text-[#e39b4d]" : "text-[#ecd3ed]/50 group-hover:text-white"
                    }`}
                  />
                  <span>{link.name}</span>
                </div>
                {link.count !== null && link.count > 0 && !isActive && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-white/15 text-white/90">
                    {link.count}
                  </span>
                )}
              </a>
            );
          })}

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate("/admin/admin-roles"); }}
            className={`relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${
              isAdminRoleActive
                ? "bg-[#8a2e6f] text-white font-medium"
                : "text-[#ecd3ed]/70 hover:text-white hover:bg-white/5"
            }`}
          >
            {isAdminRoleActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-6 bg-[#e39b4d] rounded-r-[4px]" />
            )}
            <div className="flex items-center gap-3.5">
              <ShieldCheck className={`h-5 w-5 transition-colors ${isAdminRoleActive ? "text-[#e39b4d]" : "text-[#ecd3ed]/50 group-hover:text-white"}`} />
              <span>Admin Roles</span>
            </div>
          </a>
        </nav>

        <div className="p-4 border-t border-[#ffffff]/10 space-y-3">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate("/admin/settings"); }}
            className={`relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
              segment === "settings"
                ? "bg-[#6c1674] text-white font-medium"
                : "text-[#ecd3ed]/70 hover:text-white hover:bg-white/5"
            }`}
          >
            {segment === "settings" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-6 bg-[#e39b4d] rounded-r-[4px]" />
            )}
            <Settings
              className={`h-5 w-5 transition-colors ${
                segment === "settings" ? "text-[#e39b4d]" : "text-[#ecd3ed]/50 group-hover:text-white"
              }`}
            />
            <span>Settings</span>
          </a>

          <div
            onClick={() => navigate("/admin/settings")}
            className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden border border-[#e39b4d]">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={adminName} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-white/10 text-sm font-bold text-white">
                    {adminInitial}
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold leading-tight text-white">{adminName}</span>
                <span className="truncate text-xs text-[#ecd3ed]/60">{adminEmail}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#ecd3ed]/40" />
          </div>
        </div>
      </aside>
    </>
  );
}
