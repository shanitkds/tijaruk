import { Building2, CheckCircle2, MapPin, UsersRound } from "lucide-react";
import type { UserProfileData } from "./userDashboardData";

export default function ProfileCompanyDetails({
  company,
}: {
  company: UserProfileData["company"];
}) {
  const stats = [
    { label: "Total RFQs", value: company.totalRfqs, color: "text-[#65096c]" },
    { label: "Completed", value: company.completed, color: "text-[#10b981]" },
    { label: "In Progress", value: company.inProgress, color: "text-[#e39b4d]" },
  ];

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[#111827]">Company Details</h2>
        <p className="text-xs text-[#9ca3af]">Your associated organization</p>
      </div>
      <div className="rounded-xl border border-[#cfe0ff] bg-[#eef4ff] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#3b82f6]">
            {company.logo ? (
              <img
                alt={`${company.name} logo`}
                className="size-full rounded-xl object-contain p-1"
                src={company.logo}
              />
            ) : (
              <Building2 className="size-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-[#111827]">{company.name}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-bold text-[#3b82f6]">
                <CheckCircle2 className="size-2.5" />
                VERIFIED
              </span>
            </div>
            <p className="text-xs text-[#6b7280]">{company.industry}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-[#9ca3af]">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {company.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <UsersRound className="size-3" />
                {company.size}
              </span>
            </div>
          </div>
          <p className="text-xs text-[#6b7280]">
            Member Since
            <strong className="block text-[#111827]">{company.memberSince}</strong>
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div className="rounded-xl bg-[#f9fafb] px-3 py-4 text-center" key={stat.label}>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-[10px] text-[#9ca3af]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
