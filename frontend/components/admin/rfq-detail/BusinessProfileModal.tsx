// @ts-nocheck
"use client";

import React from "react";
import { Building2, CalendarDays, FileText, User, X } from "lucide-react";

interface BusinessProfileModalProps {
  businessUser: any;
  onClose: () => void;
}

function DetailItem({ label, value, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:text-[11px]">
        {label}
      </p>
      <p className="mt-1 break-words text-[13px] font-bold leading-5 text-slate-800 sm:text-sm">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 sm:block sm:p-4 lg:p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#500c56] shadow-sm ring-1 ring-slate-100 sm:mb-3">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:text-[11px]">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-black leading-5 text-slate-900 sm:mt-1 sm:text-base lg:text-lg">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default function BusinessProfileModal({ businessUser, onClose }: BusinessProfileModalProps) {
  const isActive = businessUser.status === "ACTIVE" || businessUser.isActive;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4 lg:p-6">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-5xl sm:rounded-[28px] sm:border sm:border-white/70 lg:max-h-[calc(100dvh-3rem)] xl:max-w-6xl">
        <div className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-[#500c56] via-[#842b87] to-[#e39b4d]" />

        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f5edf6] text-lg font-black text-[#500c56] ring-1 ring-[#500c56]/10 sm:h-14 sm:w-14">
              {businessUser.photo ? (
                <img
                  src={businessUser.photo}
                  alt={businessUser.fullName || businessUser.businessName}
                  className="h-full w-full object-cover"
                />
              ) : (
                (businessUser.businessName || businessUser.fullName || "B")[0]
              )}
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-black text-slate-950 sm:text-xl lg:text-2xl">
                  {businessUser.businessName || "Not provided"}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide sm:text-[10px] ${
                    isActive ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {businessUser.status || (businessUser.isActive ? "Active" : "Pending / Inactive")}
                </span>
              </div>
              <p className="mt-1 truncate text-xs font-semibold text-slate-400 sm:text-sm">
                {businessUser.businessType || "Not provided"}
                <span className="mx-1.5 text-slate-300">•</span>
                {businessUser.industry || "Not provided"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close business profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#500c56]/30"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
              <SummaryCard icon={User} label="User ID" value={businessUser.userId} />
              <SummaryCard icon={FileText} label="CR Number" value={businessUser.crNumber} />
              <SummaryCard icon={CalendarDays} label="Joined" value={businessUser.dateJoined} />
            </section>

            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-6">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:px-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5edf6] text-[#500c56]">
                    <User className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 sm:text-base">User Details</h4>
                </div>

                <div className="grid grid-cols-1 gap-x-5 gap-y-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-1 xl:grid-cols-2">
                  <DetailItem label="Full Name" value={businessUser.fullName} />
                  <DetailItem label="Username" value={businessUser.username} />
                  <DetailItem label="Email" value={businessUser.email} className="sm:col-span-2 lg:col-span-1 xl:col-span-2" />
                  <DetailItem label="Phone" value={businessUser.phone} />
                  <DetailItem label="Role" value={businessUser.role} />
                  <DetailItem label="Role Type" value={businessUser.roleType} />
                  <DetailItem
                    label="Active"
                    value={typeof businessUser.isActive === "boolean" ? (businessUser.isActive ? "Yes" : "No") : "Not provided"}
                  />
                  <DetailItem
                    label="Verified"
                    value={typeof businessUser.isVerified === "boolean" ? (businessUser.isVerified ? "Yes" : "No") : "Not provided"}
                  />
                  <DetailItem label="User Updated" value={businessUser.updatedAt} />
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-7">
                <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:px-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5edf6] text-[#500c56]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 sm:text-base">Business Details</h4>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-4 sm:grid-cols-2 sm:p-5">
                  <DetailItem label="Business Name" value={businessUser.businessName} />
                  <DetailItem label="Contact Person" value={businessUser.contactPerson} />
                  <DetailItem label="Business Type" value={businessUser.businessType} />
                  <DetailItem label="Industry" value={businessUser.industry} />
                  <DetailItem label="Business Email" value={businessUser.businessEmail} />
                  <DetailItem label="Business Phone" value={businessUser.businessPhone} />
                  <DetailItem label="Location" value={businessUser.location} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:text-[11px]">Website</p>
                    {businessUser.website ? (
                      <a
                        href={businessUser.website}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-words text-[13px] font-bold leading-5 text-[#500c56] hover:underline sm:text-sm"
                      >
                        {businessUser.website}
                      </a>
                    ) : (
                      <p className="mt-1 text-[13px] font-bold leading-5 text-slate-800 sm:text-sm">Not provided</p>
                    )}
                  </div>
                  <DetailItem label="User Role" value={businessUser.userRole} />
                  <DetailItem label="Language" value={businessUser.language} />
                  <DetailItem label="Business Created" value={businessUser.businessCreatedAt} />
                  <DetailItem label="Business Updated" value={businessUser.businessUpdatedAt} />
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-[#500c56]/10 bg-[#faf7fa] p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#500c56]/60 sm:text-[11px]">
                Business Description
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                {businessUser.description || "No business description provided."}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
