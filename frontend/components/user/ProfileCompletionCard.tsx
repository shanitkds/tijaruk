import { CheckCircle2 } from "lucide-react";
import type { UserProfileData } from "./userDashboardData";

export default function ProfileCompletionCard({
  company,
  user,
}: {
  company: UserProfileData["company"];
  user: UserProfileData["user"];
}) {
  const fields = [
    user.name,
    user.email,
    user.phone,
    user.role,
    user.location,
    user.language,
    user.avatar,
    company.name,
    company.crNumber,
    company.businessTypeId,
    company.industryId,
    company.description,
    company.industry,
    company.location,
    company.website,
    company.contactPerson,
    company.email,
    company.phone,
    company.logo,
  ];
  const completed = fields.filter(Boolean).length;
  const total = fields.length;
  const percentage = Math.round((completed / total) * 100);

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#111827]">Profile Completion</h2>
          <p className="text-xs text-[#9ca3af]">
            {completed} of {total} profile details completed
          </p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#f3e8f4] text-[#65096c]">
          <CheckCircle2 className="size-5" />
        </span>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <strong className="text-3xl font-bold text-[#65096c]">{percentage}%</strong>
        <div className="min-w-0 flex-1">
          <div className="h-2.5 overflow-hidden rounded-full bg-[#f3e8f4]">
            <div
              className="h-full rounded-full bg-[#65096c] transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-[#6b7280]">
            {percentage === 100 ? "Your profile is complete" : "Complete missing details to reach 100%"}
          </p>
        </div>
      </div>
    </section>
  );
}
