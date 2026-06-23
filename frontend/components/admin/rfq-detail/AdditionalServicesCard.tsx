// @ts-nocheck
"use client";

import React from "react";
import { Globe } from "lucide-react";
import { Rfq } from "../RfqManagement";

interface AdditionalServicesCardProps {
  rfq: Rfq;
}

export default function AdditionalServicesCard({ rfq }: AdditionalServicesCardProps) {
  return (
    <div className="bg-white rounded-[20px] border border-[#eef0f3] p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#500c56]/10 flex items-center justify-center text-[#500c56]">
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Additional Services (International Sourcing)</h3>
        </div>
        <span className="bg-purple-50 text-[#500c56] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
          {rfq.services.length > 0 ? `${rfq.services.length} of 3 Selected` : "0 of 3 Selected"}
        </span>
      </div>

      <div className="space-y-3">
        {rfq.services.map((service) => (
          <div
            className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 shadow-sm bg-white"
            key={service.name}
          >
            <h4 className="text-xs font-bold text-gray-800">{service.name}</h4>
            <span className="bg-[#f2e6f4] text-[#500c56] text-[9px] font-bold px-3 py-1 rounded-full">
              Selected
            </span>
          </div>
        ))}
        {rfq.services.length === 0 ? (
          <p className="rounded-xl bg-gray-50 p-4 text-center text-xs font-semibold text-gray-400">
            No additional services selected.
          </p>
        ) : null}
      </div>
    </div>
  );
}
