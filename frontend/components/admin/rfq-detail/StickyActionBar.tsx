// @ts-nocheck
"use client";

import React from "react";
import { Clock } from "lucide-react";
import { Rfq } from "../RfqManagement";

interface StickyActionBarProps {
  rfq: Rfq;
  isUpdatingStatus: boolean;
  statusMessage: string;
  statusError: string;
  onOpenEdit: () => void;
  onStatusChange: (status: "Approved" | "Pending" | "Rejected") => void;
}

export default function StickyActionBar({
  rfq,
  isUpdatingStatus,
  statusMessage,
  statusError,
  onOpenEdit,
  onStatusChange,
}: StickyActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 lg:left-[265px] right-0 z-40 bg-white border-t border-gray-100 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Awaiting Final Decision</span>
          <span className="text-xs font-bold text-gray-700 mt-0.5">RFQ submitted {rfq.date} — {rfq.status === "Pending" ? "Pending Review" : "Decision Handled"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={onOpenEdit}
          className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-bold active:scale-95 transition-all"
        >
          Edit RFQ
        </button>
        <button
          onClick={() => onStatusChange("Rejected")}
          className="flex-1 sm:flex-none px-4 py-2 bg-[#ee3f43] hover:bg-[#d83539] text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm shadow-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isUpdatingStatus}
        >
          {isUpdatingStatus ? "Updating..." : "Reject"}
        </button>
        <button
          onClick={() => onStatusChange("Approved")}
          className="flex-1 sm:flex-none px-4 py-2 bg-[#12b86e] hover:bg-[#109e5f] text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm shadow-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isUpdatingStatus}
        >
          {isUpdatingStatus ? "Updating..." : "Approve"}
        </button>
      </div>
    </div>
  );
}
