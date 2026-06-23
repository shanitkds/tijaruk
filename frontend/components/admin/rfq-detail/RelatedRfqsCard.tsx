// @ts-nocheck
"use client";

import React from "react";
import { History, FileText, ArrowRight } from "lucide-react";
import { Rfq } from "../RfqManagement";

interface RelatedRfqsCardProps {
  relatedRfqs: Rfq[];
  onBack: () => void;
}

export default function RelatedRfqsCard({ relatedRfqs, onBack }: RelatedRfqsCardProps) {
  return (
    <div className="bg-white rounded-[20px] border border-[#eef0f3] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-[#500c56]" />
        <h3 className="font-bold text-gray-900 text-sm">Related RFQs</h3>
      </div>
      <div className="space-y-3">
        {relatedRfqs.map((relRfq) => (
          <div key={relRfq.id} className="flex items-center gap-3 p-3.5 border border-gray-100 rounded-[14px] bg-white">
            <div className="w-8 h-8 rounded-[8px] bg-[#f2e6f4] flex items-center justify-center text-[#500c56] shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-gray-800 leading-tight truncate">{relRfq.id}</h4>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">{relRfq.productName.split(" (")[0]} · {relRfq.quantity}</p>
            </div>
            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
              relRfq.status === "Approved" ? "bg-emerald-50 text-emerald-600" :
              relRfq.status === "Pending" ? "bg-orange-50 text-orange-500" :
              "bg-rose-50 text-rose-500"
            }`}>
              {relRfq.status}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={onBack}
        className="w-full flex justify-center items-center gap-1.5 text-xs font-bold text-gray-500 border border-gray-200 py-2.5 rounded-[12px] hover:bg-gray-50 transition-all mt-4"
      >
        <span>View All RFQs</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
