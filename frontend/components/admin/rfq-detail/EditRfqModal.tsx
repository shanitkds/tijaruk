// @ts-nocheck
"use client";

import React from "react";
import { FileText, AlertTriangle } from "lucide-react";
import { Rfq } from "../RfqManagement";

interface EditRfqModalProps {
  rfq: Rfq;
  editQty: string;
  setEditQty: (val: string) => void;
  editPrice: string;
  editUnit: string;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

export default function EditRfqModal({
  rfq,
  editQty,
  setEditQty,
  editPrice,
  editUnit,
  onClose,
  onSave,
}: EditRfqModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100">
        <div className="bg-[#500c56] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-400" />
            <h4 className="text-sm font-bold">Edit Quotation Values — {rfq.id}</h4>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50/50 border border-amber-100/30 rounded-xl text-amber-800 text-xs">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <p>Editing this quote will instantly recalculate the total value and update the stats.</p>
          </div>

          {/* Quantity Requested */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Quantity Requested</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={editQty}
                onChange={(e) => setEditQty(e.target.value)}
                className="flex-1 bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                required
              />
              <input
                type="text"
                value={editUnit}
                placeholder="Unit"
                className="w-24 bg-gray-100 border border-[#eef0f3] rounded-xl px-3 py-2.5 text-sm text-gray-500"
                disabled
              />
            </div>
          </div>

          {/* Price per Unit */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Price per Unit (SAR)</label>
            <input
              type="number"
              value={editPrice}
              className="w-full bg-gray-100 border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm text-gray-500"
              disabled
            />
          </div>

          {/* Expected Total */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center mt-2">
            <span className="text-xs font-semibold text-gray-500">Calculated Total</span>
            <span className="text-base font-extrabold text-[#500c56]">
              SAR {((parseFloat(editQty) || 0) * (parseFloat(editPrice) || 0)).toLocaleString()}
            </span>
          </div>

          {/* Form Buttons */}
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#500c56] hover:bg-[#6c1674] text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
