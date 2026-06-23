// @ts-nocheck
"use client";

import React from "react";
import { FileText, Globe, Paperclip } from "lucide-react";
import { Rfq } from "../RfqManagement";

interface RfqDetailsCardProps {
  rfq: Rfq;
}

export default function RfqDetailsCard({ rfq }: RfqDetailsCardProps) {
  return (
    <div className="bg-white rounded-[20px] border border-[#eef0f3] p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#500c56]/10 flex items-center justify-center text-[#500c56]">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">RFQ Details</h3>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
          rfq.status === "Approved" ? "bg-emerald-50 text-[#12b86e]" :
          rfq.status === "Pending" ? "bg-amber-50 text-[#e39b4d]" :
          "bg-rose-50 text-[#ee3f43]"
        }`}>
          {rfq.status === "Approved" ? "Approved" : rfq.status === "Pending" ? "Pending Review" : "Rejected"}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-5">
        <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden shrink-0 border border-gray-100">
          <img src={rfq.image} alt={rfq.productName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Product Name</span>
            <h4 className="text-base font-extrabold text-gray-900 mt-0.5">{rfq.productName}</h4>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="bg-[#500c56]/10 text-[#500c56] text-[10px] px-2 py-0.5 rounded-full font-bold">
                {rfq.category}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold">SKU: {rfq.sku}</span>
              <span className="text-[10px] text-blue-500 font-semibold flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {rfq.sourcingType || "Not provided"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Quantity</span>
              <p className="text-sm font-extrabold text-gray-800 mt-0.5">{rfq.productQuantity}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Product Price</span>
              <p className="text-sm font-extrabold text-gray-800 mt-0.5">
                {rfq.pricePerUnit} / {rfq.qtyUnit}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Product Description</span>
        <p className="text-xs text-gray-500 leading-relaxed font-medium mt-1">{rfq.description}</p>
        <span className="mt-4 block text-[10px] text-gray-400 font-bold uppercase tracking-wide">
          Buyer Requirements
        </span>
        <p className="text-xs text-gray-500 leading-relaxed font-medium mt-1">
          {rfq.additionalDetails}
        </p>
        {rfq.attachment ? (
          <a
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#500c56] hover:underline"
            href={rfq.attachment}
            rel="noreferrer"
            target="_blank"
          >
            <Paperclip className="size-3.5" />
            View RFQ attachment
          </a>
        ) : null}
      </div>
    </div>
  );
}
