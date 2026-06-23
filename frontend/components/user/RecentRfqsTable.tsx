"use client";

import { Ellipsis, Eye, FileText } from "lucide-react";
import type { RecentRfq } from "./userDashboardData";

const statusStyles = {
  Approved: "bg-[#dff9ee] text-[#059669]",
  Pending: "bg-[#fff3d6] text-[#d97706]",
  Rejected: "bg-[#ffe4e6] text-[#dc2626]",
};

export default function RecentRfqsTable({
  onView,
  rfqs,
}: {
  onView?: (rfq: RecentRfq) => void;
  rfqs: RecentRfq[];
}) {
  return (
    <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
      <table className="w-full min-w-[650px] text-left">
        <thead>
          <tr className="border-y border-[#f0edf0] text-[10px] font-bold uppercase tracking-[0.5px] text-[#9ca3af]">
            <th className="px-5 py-3">RFQ ID & Product</th>
            <th className="px-5 py-3">Sourcing</th>
            <th className="px-5 py-3">Qty</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0edf0]">
          {rfqs.map((rfq) => (
            <tr className="text-sm text-[#374151]" key={rfq.id}>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f8f9fa] text-[#9ca3af]">
                    <FileText aria-hidden="true" className="size-4" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold leading-5 text-[#111827]">{rfq.product}</p>
                    <p className="truncate text-xs leading-4 text-[#9ca3af]">{rfq.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-xs font-medium text-[#6b7280]">{rfq.sourcing}</td>
              <td className="px-5 py-4 text-xs font-bold text-[#111827]">{rfq.quantity}</td>
              <td className="px-5 py-4">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[rfq.status]}`}>
                  <span className="size-1.5 rounded-full bg-current" />
                  {rfq.status}
                </span>
              </td>
              <td className="px-5 py-4 text-xs font-medium text-[#6b7280]">{rfq.date}</td>
              <td className="px-5 py-4 text-right">
                <button
                  aria-label={onView ? `View ${rfq.id} details` : `Open ${rfq.id} actions`}
                  className="inline-flex size-8 items-center justify-center rounded-full text-[#9ca3af] transition hover:bg-[#f8f9fa] hover:text-[#65096c]"
                  onClick={() => onView?.(rfq)}
                  type="button"
                >
                  {onView ? (
                    <Eye aria-hidden="true" className="size-4" strokeWidth={2} />
                  ) : (
                    <Ellipsis aria-hidden="true" className="size-4" strokeWidth={2} />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
