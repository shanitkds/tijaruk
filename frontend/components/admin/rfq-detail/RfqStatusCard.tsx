// @ts-nocheck
"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { Rfq } from "../RfqManagement";

interface RfqStatusCardProps {
  rfq: Rfq;
  deadlineDate: string;
}

export default function RfqStatusCard({ rfq, deadlineDate }: RfqStatusCardProps) {
  return (
    <div className="bg-white rounded-[20px] border border-[#eef0f3] overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-[#500c56] text-white">
        <h3 className="font-bold text-sm">RFQ Status</h3>
        <p className="text-[10px] text-white/75 mt-0.5 font-medium">Current state of this request</p>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-3.5 text-xs border-b border-gray-100 pb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold">Status</span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
              rfq.status === "Approved" ? "bg-emerald-50 text-[#12b86e]" :
              rfq.status === "Pending" ? "bg-amber-50 text-[#e39b4d]" :
              "bg-rose-50 text-[#ee3f43]"
            }`}>
              {rfq.status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold">RFQ ID</span>
            <span className="font-black text-[#500c56]">{rfq.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold">Submitted</span>
            <span className="font-bold text-gray-700">{rfq.date}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Deadline</span>
            </span>
            <span className="font-bold text-rose-600">{deadlineDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold">Priority</span>
            <span className="font-bold text-amber-500">★ High</span>
          </div>
        </div>

        {/* Progress Tracker Vertical Timeline */}
        <div className="space-y-4 pt-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Progress Tracker</p>
          <div className="relative pl-5 space-y-4">
            {/* Vertical line indicator */}
            <div className="absolute top-1 bottom-1 left-[5px] w-0.5 bg-gray-100" />

            {/* Step 1 */}
            <div className="relative flex items-center gap-3">
              <div className="absolute left-[-24px] w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200" />
              <span className="text-xs font-extrabold text-gray-800">RFQ Submitted</span>
              <span className="text-[9px] text-emerald-500 font-bold ml-auto">Done</span>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center gap-3">
              <div className="absolute left-[-24px] w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200" />
              <span className="text-xs font-extrabold text-gray-800">Supplier Notified</span>
              <span className="text-[9px] text-emerald-500 font-bold ml-auto">Done</span>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center gap-3">
              <div className={`absolute left-[-24px] w-2.5 h-2.5 rounded-full border-2 border-white ring-2 ${
                rfq.status === "Pending" ? "bg-amber-500 ring-amber-200" : "bg-emerald-500 ring-emerald-200"
              }`} />
              <span className={`text-xs font-extrabold ${rfq.status === "Pending" ? "text-amber-500" : "text-gray-800"}`}>Admin Review</span>
              <span className={`text-[9px] font-bold ml-auto ${rfq.status === "Pending" ? "text-amber-500" : "text-emerald-500"}`}>
                {rfq.status === "Pending" ? "Active" : "Done"}
              </span>
            </div>

            {/* Step 4 */}
            <div className="relative flex items-center gap-3">
              <div className={`absolute left-[-24px] w-2.5 h-2.5 rounded-full border-2 border-white ring-2 ${
                rfq.status === "Pending" ? "bg-gray-200 ring-gray-100" :
                rfq.status === "Approved" ? "bg-emerald-500 ring-emerald-200" : "bg-rose-500 ring-rose-200"
              }`} />
              <span className={`text-xs font-extrabold ${rfq.status === "Pending" ? "text-gray-400" : "text-gray-800"}`}>Final Decision</span>
              <span className={`text-[9px] font-bold ml-auto ${
                rfq.status === "Pending" ? "text-gray-400" :
                rfq.status === "Approved" ? "text-emerald-500" : "text-rose-500"
              }`}>
                {rfq.status === "Pending" ? "Pending" : rfq.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
