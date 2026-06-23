// @ts-nocheck
"use client";

import React from "react";
import { X, User, Building } from "lucide-react";
import { Rfq } from "../RfqManagement";

interface SupplierProfileModalProps {
  rfq: Rfq;
  onClose: () => void;
}

export default function SupplierProfileModal({ rfq, onClose }: SupplierProfileModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] shadow-2xl border border-gray-100 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center text-[#500c56] font-black text-xl">
              {rfq.supplier.logo ? (
                <img src={rfq.supplier.logo} alt={rfq.supplier.name} className="w-full h-full object-cover" />
              ) : (
                rfq.supplier.name[0]
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-gray-900">{rfq.supplier.name}</h3>
                {rfq.supplier.verified ? (
                  <span className="bg-[#e2f6ed] text-[#12b86e] text-[10px] font-bold px-2.5 py-1 rounded-full">
                    Active Supplier
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    Pending / Inactive
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-400 mt-1">
                {rfq.supplier.productType || "Not provided"} - {rfq.supplier.location}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#f8f9fa] border border-gray-100 p-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Minimum Order</p>
              <p className="text-lg font-black text-gray-900 mt-1">
                {rfq.supplier.minimumOrderQuantity
                  ? rfq.supplier.minimumOrderQuantity.toLocaleString()
                  : "Not set"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8f9fa] border border-gray-100 p-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Joined</p>
              <p className="text-lg font-black text-gray-900 mt-1">{rfq.supplier.joinedAt || "Not provided"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
              <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#500c56]" />
                Contact Details
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Representative</p>
                  <p className="font-extrabold text-gray-800 mt-0.5">{rfq.supplier.contactName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
                  <p className="font-extrabold text-gray-800 mt-0.5 break-all">{rfq.supplier.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone</p>
                  <p className="font-extrabold text-gray-800 mt-0.5">{rfq.supplier.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</p>
                  <p className="font-extrabold text-gray-800 mt-0.5">{rfq.supplier.location}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
              <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#500c56]" />
                Company Details
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Product Type</p>
                  <p className="font-extrabold text-gray-800 mt-0.5">{rfq.supplier.productType || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment Terms</p>
                  <p className="font-extrabold text-gray-800 mt-0.5">{rfq.supplier.paymentTerms || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Website</p>
                  {rfq.supplier.website ? (
                    <a
                      href={rfq.supplier.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-extrabold text-[#500c56] hover:underline mt-0.5 inline-flex break-all"
                    >
                      {rfq.supplier.website}
                    </a>
                  ) : (
                    <p className="font-extrabold text-gray-800 mt-0.5">Not provided</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Supplier ID</p>
                  <p className="font-extrabold text-gray-800 mt-0.5">
                    {rfq.supplier.apiId ? `#SUP-${String(rfq.supplier.apiId).padStart(5, "0")}` : "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-[#fafafb] p-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">About Supplier</p>
            <p className="text-sm text-gray-600 leading-relaxed font-semibold mt-2">
              {rfq.supplier.description || "No supplier description provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
