import Link from "next/link";
import type { ReactNode } from "react";

export default function SectionCard({
  title,
  actionLabel,
  actionHref,
  children,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-xl border border-[#e8e3e8] bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5">
        <div>
          <h2 className="text-base font-bold leading-6 text-[#111827]">{title}</h2>
          {title === "Recent RFQs" ? (
            <p className="mt-1 text-xs leading-4 text-[#6b7280]">
              Track and manage your latest sourcing requests.
            </p>
          ) : null}
        </div>
        {actionLabel && actionHref ? (
          <Link
            className="shrink-0 text-xs font-bold leading-5 text-[#65096c] transition hover:text-[#4d0752]"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
