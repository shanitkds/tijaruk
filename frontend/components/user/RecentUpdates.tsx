import { Check } from "lucide-react";
import SectionCard from "./SectionCard";
import type { RecentUpdate } from "./userDashboardData";

const updateStyles = {
  success: "bg-[#dff9ee] text-[#13b981]",
  info: "bg-[#e8f0ff] text-[#3b82f6]",
  warning: "bg-[#fff3d6] text-[#e39b4d]",
};

export default function RecentUpdates({ updates }: { updates: RecentUpdate[] }) {
  return (
    <SectionCard title="Recent Updates">
      <div className="space-y-4 px-5 pb-5">
        {updates.map((update) => (
          <div className="flex gap-3" key={update.id}>
            <span className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full ${updateStyles[update.tone]}`}>
              <Check aria-hidden="true" className="size-3" strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-semibold leading-5 text-[#111827]">{update.title}</p>
              <p className="mt-0.5 text-xs leading-4 text-[#9ca3af]">{update.time}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
