import type { DashboardStat } from "./userDashboardData";

export default function DashboardStatCard({ stat }: { stat: DashboardStat }) {
  const Icon = stat.icon;
  const trendClassName =
    stat.trend === "up"
      ? "text-[#13b981]"
      : stat.trend === "down"
        ? "text-[#f04444]"
        : "text-[#e39b4d]";

  return (
    <article className="rounded-xl border border-[#e8e3e8] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium leading-4 text-[#6b7280]">{stat.title}</p>
          <p className="mt-2 text-2xl font-bold leading-8 text-[#111827]">{stat.value}</p>
        </div>
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${stat.iconClassName}`}>
          <Icon aria-hidden="true" className="size-4" strokeWidth={2.2} />
        </span>
      </div>
      <p className="mt-3 text-xs leading-4 text-[#9ca3af]">
        <span className={`font-semibold ${trendClassName}`}>{stat.change.split(" ")[0]}</span>{" "}
        {stat.change.split(" ").slice(1).join(" ")}
      </p>
    </article>
  );
}
