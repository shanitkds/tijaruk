import { Camera, CheckCircle2, Edit3, MapPin } from "lucide-react";
import type { UserProfileData } from "./userDashboardData";

export default function UserProfileHero({
  onEditProfile,
  user,
}: {
  onEditProfile: () => void;
  user: UserProfileData["user"];
}) {
  const usernameInitial = user.username.trim().charAt(0).toUpperCase() || "U";

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
      <div className="relative h-24 bg-gradient-to-r from-[#65096c] via-[#9412a0] to-[#bf32c7]">
        <button
          className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white"
          type="button"
        >
          <Camera className="size-3.5" />
          Change Cover
        </button>
      </div>
      <div className="relative flex flex-col gap-4 px-5 pb-5 pt-14 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:pt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div
            aria-label={`${user.name} profile`}
            className="absolute -top-12 flex size-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#f3e8f4] text-3xl font-bold text-[#65096c] shadow-md sm:relative sm:-top-10"
            role="img"
          >
            {user.avatar ? (
              <img
                alt={`${user.username} profile`}
                className="size-full object-cover"
                src={user.avatar}
              />
            ) : (
              usernameInitial
            )}
            <span className="absolute bottom-1 right-1 flex size-6 items-center justify-center rounded-lg bg-[#65096c] text-white">
              <Camera className="size-3" />
            </span>
          </div>
          <div className="sm:pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-[#111827]">{user.username}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#dff9ee] px-2.5 py-1 text-[10px] font-bold text-[#059669]">
                <CheckCircle2 className="size-3" />
                Verified
              </span>
            </div>
            <p className="mt-1 text-sm text-[#6b7280]">
              {user.role} - {user.company}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#9ca3af]">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {user.location}
              </span>
              <span>Member since {user.memberSince}</span>
              <span>{user.completedRfqs} RFQs Completed</span>
            </div>
          </div>
        </div>
        <button
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#65096c] px-5 text-sm font-semibold text-white shadow-sm sm:w-auto"
          onClick={onEditProfile}
          type="button"
        >
          <Edit3 className="size-3.5" />
          Edit Profile
        </button>
      </div>
    </section>
  );
}
