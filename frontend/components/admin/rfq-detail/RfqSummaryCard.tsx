// @ts-nocheck
"use client";

import React from "react";
import { LayoutList, LayoutGrid, Package, DollarSign, Calculator, Globe, MapPin, Truck } from "lucide-react";
import { Rfq } from "../RfqManagement";

interface RfqSummaryCardProps {
  rfq: Rfq;
}

export default function RfqSummaryCard({ rfq }: RfqSummaryCardProps) {
  const isInternationalRfq = rfq.sourcingType === "International Sourcing";

  return (
    <div className="bg-white rounded-[20px] border border-[#eef0f3] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <LayoutList className="w-4 h-4 text-[#500c56]" />
        <h3 className="font-bold text-gray-900 text-sm">RFQ Summary</h3>
      </div>
      <div className="space-y-2.5">
        {/* Product */}
        <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#fafafb] border border-gray-100/50">
          <div className="w-8 h-8 rounded-[8px] bg-[#f2e6f4] flex items-center justify-center text-[#500c56] shrink-0">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold leading-tight">Product</span>
            <span className="text-xs font-bold text-gray-800 leading-tight mt-0.5">{rfq.productName.split(" (")[0]}</span>
          </div>
        </div>

        {/* Total Quantity */}
        <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#fafafb] border border-gray-100/50">
          <div className="w-8 h-8 rounded-[8px] bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold leading-tight">Total Quantity</span>
            <span className="text-xs font-bold text-gray-800 leading-tight mt-0.5">{rfq.quantity}</span>
          </div>
        </div>

        {/* Requested Price */}
        <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#fafafb] border border-gray-100/50">
          <div className="w-8 h-8 rounded-[8px] bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold leading-tight">Requested Price</span>
            <span className="text-xs font-bold text-gray-800 leading-tight mt-0.5">{rfq.totalValue}</span>
          </div>
        </div>

        {/* Price Per Unit */}
        <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#fafafb] border border-gray-100/50">
          <div className="w-8 h-8 rounded-[8px] bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold leading-tight">Price Per Unit</span>
            <span className="text-xs font-bold text-gray-800 leading-tight mt-0.5">{rfq.pricePerUnit} / Unit</span>
          </div>
        </div>

        {/* Product Type */}
        <div className="flex items-center gap-3 p-3 rounded-[12px] bg-blue-50/40 border border-blue-100/50">
          <div className="w-8 h-8 rounded-[8px] bg-blue-100/50 flex items-center justify-center text-blue-500 shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold leading-tight">Product Type</span>
            <span className="text-xs font-bold text-blue-600 leading-tight mt-0.5">
              {rfq.sourcingType || "Not provided"}
            </span>
          </div>
        </div>

        {isInternationalRfq ? (
          <div className="flex items-center gap-3 p-3 rounded-[12px] bg-amber-50/50 border border-amber-100/60">
            <div className="w-8 h-8 rounded-[8px] bg-amber-100/70 flex items-center justify-center text-amber-600 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-semibold leading-tight">Shipping Cost</span>
              <span className="text-xs font-bold text-amber-700 leading-tight mt-0.5">
                {rfq.shippingCost || "Not provided"}
              </span>
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#fafafb] border border-gray-100/50">
          <div className="w-8 h-8 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold leading-tight">Preferred Origin</span>
            <span className="text-xs font-bold text-gray-800 leading-tight mt-0.5">
              {rfq.preferredCountry || "Not specified"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
