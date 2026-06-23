// @ts-nocheck
"use client";

import React from "react";
import { User, MapPin, Mail, Phone } from "lucide-react";
import { getMediaUrl } from "../../../lib/media";

interface BusinessUserInfoCardProps {
  businessUser: any;
  onViewProfile: () => void;
}

export default function BusinessUserInfoCard({ businessUser, onViewProfile }: BusinessUserInfoCardProps) {
  return (
    <div className="bg-white rounded-[20px] border border-[#eef0f3] p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#500c56]/10 flex items-center justify-center text-[#500c56]">
            <User className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Business User Information</h3>
        </div>
        {businessUser.isVerified ? (
          <span className="bg-[#e2f6ed] text-[#12b86e] text-[9px] font-bold px-2 py-0.5 rounded-full">
            Verified User
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center font-bold text-gray-400 text-lg shadow-inner">
            {businessUser.photo ? (
              <img src={getMediaUrl(businessUser.photo)} alt={businessUser.fullName || businessUser.businessName} className="h-full w-full object-cover" />
            ) : (
              (businessUser.businessName || businessUser.fullName || "B")[0]
            )}
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-sm">{businessUser.businessName || "Not provided"}</h4>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-gray-500">
              <MapPin className="w-3 h-3 text-gray-400" />
              {businessUser.location || "Not provided"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onViewProfile}
          className="px-3 py-1.5 border border-[#500c56] text-[#500c56] hover:bg-[#500c56]/5 text-xs font-bold rounded-lg transition-all"
        >
          View Profile
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/50 border border-blue-50">
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm shrink-0">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wide">Email</span>
            <span className="text-xs font-bold text-gray-700">{businessUser.businessEmail || businessUser.email || "Not provided"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-50">
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wide">Phone</span>
            <span className="text-xs font-bold text-gray-700">{businessUser.businessPhone || businessUser.phone || "Not provided"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
