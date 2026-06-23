// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { adminToast } from "./AdminToast";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Tag,
  X,
  Edit3,
  Check,
  AlertTriangle,
  Calendar,
  Filter,
  Send,
  User,
  MapPin,
} from "lucide-react";

export interface Rfq {
  apiId: number;
  id: string;
  productName: string;
  category: string;
  qtyVal: number;
  qtyUnit: string;
  quantity: string;
  priceVal: number;
  priceUnit: string;
  pricePerUnit: string;
  shippingCost?: string;
  totalValue: string;
  productQuantity: string;
  status: "Approved" | "Pending" | "Rejected";
  date: string;
  time: string;
  sku: string;
  description: string;
  additionalDetails: string;
  image: string;
  services: { name: string; cost: string }[];
  supplier: {
    apiId?: number;
    name: string;
    contactName?: string;
    rating: string;
    reviews: string;
    location: string;
    verified: boolean;
    email: string;
    phone: string;
    productType?: string;
    description?: string;
    website?: string;
    logo?: string;
    paymentTerms?: string;
    minimumOrderQuantity?: number;
    joinedAt?: string;
  };
  unitId: number;
  attachment?: string;
  preferredCountry?: string;
  budgetRange?: string;
  dueDate?: string;
  sourcingType?: string;
  contactPerson?: string;
  contactEmail?: string;
  businessName?: string;
  contactPhone?: string;
  contactIndustry?: string;
  contactLocation?: string;
  businessUser?: {
    userId?: string;
    username?: string;
    fullName?: string;
    email: string;
    phone?: string;
    role?: string;
    roleType?: string;
    isActive?: boolean;
    isVerified?: boolean;
    photo?: string;
    dateJoined?: string;
    updatedAt?: string;
    businessId?: number;
    businessName?: string;
    crNumber?: string;
    businessType?: string;
    industry?: string;
    status?: string;
    description?: string;
    location?: string;
    website?: string;
    logo?: string;
    contactPerson?: string;
    businessEmail?: string;
    businessPhone?: string;
    userRole?: string;
    language?: string;
    businessCreatedAt?: string;
    businessUpdatedAt?: string;
  };
}

interface RfqManagementProps {
  rfqList: Rfq[];
  setRfqList: React.Dispatch<React.SetStateAction<Rfq[]>>;
  isLoading?: boolean;
  loadError?: string;
  selectedRfqId: string | null;
  setSelectedRfqId: (id: string | null) => void;
  filterSegment: "All" | "Pending" | "Approved";
  setFilterSegment: (segment: "All" | "Pending" | "Approved") => void;
  onViewDetailed: (id: string) => void;
}

function getApiErrorMessage(error: any, fallback: string) {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.error === "string") return data.error;

  const firstValue = Object.values(data)[0];
  if (typeof firstValue === "string") return firstValue;
  if (Array.isArray(firstValue)) return firstValue[0] || fallback;
  return fallback;
}

export default function RfqManagement({
  rfqList,
  setRfqList,
  isLoading = false,
  loadError = "",
  selectedRfqId,
  setSelectedRfqId,
  filterSegment,
  setFilterSegment,
  onViewDetailed
}: RfqManagementProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editQty, setEditQty] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editUnit, setEditUnit] = useState("");
  // Statistics calculation based on live rfqList state
  const totalCount = rfqList.length;
  const pendingCount = rfqList.filter((rfq) => rfq.status === "Pending").length;
  const approvedCount = rfqList.filter((rfq) => rfq.status === "Approved").length;
  const rejectedCount = rfqList.filter((rfq) => rfq.status === "Rejected").length;

  const selectedRfq = rfqList.find((r) => r.id === selectedRfqId) || null;
  const selectedBusinessUser = selectedRfq?.businessUser;
  const selectedUserFullName = selectedBusinessUser?.fullName || "Not provided";
  const selectedUserRoleType = selectedBusinessUser?.roleType || "Not provided";
  const selectedBusinessLocation =
    selectedBusinessUser?.location || selectedRfq?.contactLocation || "Not provided";

  // Filtered List
  const filteredRfqs = rfqList.filter((rfq) => {
    if (filterSegment === "All") return true;
    return rfq.status === filterSegment;
  });

  const showStatusToast = (type: "success" | "error", title: string, body: string) => {
    adminToast[type](title, body);
  };

  useEffect(() => {
    if (loadError) adminToast.error("Unable to load RFQs", loadError);
  }, [loadError]);

  const handleStatusChange = async (id: string, newStatus: "Approved" | "Pending" | "Rejected") => {
    const rfq = rfqList.find((item) => item.id === id);
    if (!rfq) return;

    try {
      const { data } = await api.patch(`/rfqs/${rfq.apiId}/status/`, { status: newStatus.toUpperCase() });
      setRfqList((prev) =>
        prev.map((item) => (
          item.id === id
            ? {
                ...item,
                status: newStatus,
                productQuantity: data.product_stock_quantity === null
                  ? "Not tracked"
                  : `${Number(data.product_stock_quantity).toLocaleString()} ${data.product_unit_name || item.qtyUnit}`,
              }
            : item
        ))
      );
      showStatusToast("success", `RFQ ${newStatus}`, `${rfq.id} has been marked as ${newStatus}.`);
    } catch (error) {
      showStatusToast(
        "error",
        newStatus === "Approved" ? "Unable to approve RFQ" : "Unable to update RFQ",
        getApiErrorMessage(error, "Unable to update RFQ status. Please try again."),
      );
    }
  };

  const handleEditClick = (rfq: Rfq) => {
    setEditQty(rfq.qtyVal.toString());
    setEditPrice(rfq.priceVal.toString());
    setEditUnit(rfq.qtyUnit);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfqId) return;

    const qty = parseFloat(editQty) || 0;
    const price = parseFloat(editPrice) || 0;
    const total = qty * price;

    // Format total value cleanly (e.g. SAR 960K, SAR 1.2M, or normal value if smaller)
    let formattedTotal = `SAR ${(total).toLocaleString()}`;
    if (total >= 1000000) {
      formattedTotal = `SAR ${(total / 1000000).toFixed(1)}M`;
    } else if (total >= 1000) {
      formattedTotal = `SAR ${(total / 1000).toFixed(0)}K`;
    }

    setRfqList((prev) =>
      prev.map((rfq) => {
        if (rfq.id === selectedRfqId) {
          return {
            ...rfq,
            qtyVal: qty,
            priceVal: price,
            qtyUnit: editUnit,
            quantity: `${qty.toLocaleString()} ${editUnit}`,
            pricePerUnit: `SAR ${price.toLocaleString()}`,
            totalValue: formattedTotal
          };
        }
        return rfq;
      })
    );
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* RFQ Management Mini-Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total RFQs */}
        <div className="bg-white border border-[#eef0f3] rounded-[16px] p-5 flex items-center gap-4 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-[#f2e6f4] flex items-center justify-center text-[#500c56] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Total RFQs</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{totalCount.toLocaleString()}</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-[#eef0f3] rounded-[16px] p-5 flex items-center gap-4 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-[#fff5ea] flex items-center justify-center text-[#e39b4d] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Pending</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{pendingCount}</p>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white border border-[#eef0f3] rounded-[16px] p-5 flex items-center gap-4 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-[#e2f6ed] flex items-center justify-center text-[#12b86e] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Approved</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{approvedCount}</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-[#eef0f3] rounded-[16px] p-5 flex items-center gap-4 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-[#ffe8eb] flex items-center justify-center text-[#ee3f43] shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Rejected</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{rejectedCount}</p>
          </div>
        </div>
      </section>

      {/* Grid content */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: RFQ List Table Card */}
        <div className={`flex ${selectedRfqId ? "md:col-span-2" : "md:col-span-3"} flex-col justify-between bg-white rounded-[20px] border border-[#eef0f3] p-6 shadow-sm min-h-[680px] transition-all duration-300`}>
          <div>
            {/* Header elements */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-gray-900">RFQ List</h3>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-[#500c56]/10 text-[#500c56] rounded-full">
                  {totalCount.toLocaleString()} total
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                {/* Export button */}
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </button>

                {/* Filter Segment tabs */}
                <div className="bg-[#f8f9fa] border border-[#eef0f3] rounded-lg p-0.5 flex">
                  {(["All", "Pending", "Approved"] as const).map((segment) => (
                    <button
                      key={segment}
                      onClick={() => setFilterSegment(segment)}
                      className={`text-xs px-3.5 py-1 rounded-md font-bold transition-all duration-200 ${(filterSegment === "All" && segment === "All") ||
                          (filterSegment === "Pending" && segment === "Pending") ||
                          (filterSegment === "Approved" && segment === "Approved")
                          ? "bg-[#500c56] text-white shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      {segment}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3.5 font-bold whitespace-nowrap">RFQ ID</th>
                      <th className="pb-3.5 font-bold whitespace-nowrap">Product</th>
                      <th className="pb-3.5 font-bold whitespace-nowrap">Quantity</th>
                      <th className="pb-3.5 font-bold whitespace-nowrap">Status</th>
                      <th className="pb-3.5 font-bold whitespace-nowrap">Date</th>
                      <th className="pb-3.5 font-bold text-center whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-700">
                    {filteredRfqs.map((rfq) => {
                      const isSelected = selectedRfqId === rfq.id;
                      return (
                        <tr
                          key={rfq.id}
                          onClick={() => setSelectedRfqId(rfq.id)}
                          className="hover:bg-gray-50/50 transition-colors cursor-pointer bg-white"
                        >
                          {/* RFQ ID */}
                          <td className={`py-4 font-bold whitespace-nowrap ${isSelected ? "text-[#500c56]" : "text-gray-800"
                            }`}>
                            {rfq.id}
                          </td>

                          {/* Product Info */}
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
                                <img src={rfq.image} alt={rfq.productName} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 line-clamp-1">{rfq.productName.split(" (")[0]}</p>
                                <p className="text-[10px] text-gray-400 font-semibold">{rfq.category}</p>
                              </div>
                            </div>
                          </td>

                          {/* Quantity */}
                          <td className="py-4 font-semibold text-gray-700 whitespace-nowrap">
                            {rfq.quantity}
                          </td>

                          {/* Status */}
                          <td className="py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${rfq.status === "Approved" ? "bg-[#e2f6ed] text-[#12b86e]" :
                                rfq.status === "Pending" ? "bg-[#fff3e8] text-[#e39b4d]" :
                                  "bg-[#ffe8eb] text-[#ee3f43]"
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${rfq.status === "Approved" ? "bg-[#12b86e]" :
                                  rfq.status === "Pending" ? "bg-[#e39b4d]" :
                                    "bg-[#ee3f43]"
                                }`} />
                              {rfq.status}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-4 text-gray-400 font-medium whitespace-nowrap">
                            {rfq.date}
                          </td>

                          {/* Action */}
                          <td className="py-4 text-center whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewDetailed(rfq.id);
                              }}
                              className={`p-1.5 rounded-full transition-all duration-200 ${isSelected
                                  ? "bg-[#500c56] text-white shadow-sm shadow-[#500c56]/20"
                                  : "text-[#8c9ba5] bg-[#f1f3f6] hover:bg-[#e4e7ec]"
                                }`}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!isLoading && !loadError && filteredRfqs.length === 0 ? (
                      <tr>
                        <td className="py-12 text-center text-sm text-gray-400" colSpan={6}>
                          No RFQs found.
                        </td>
                      </tr>
                    ) : null}
                    {isLoading ? (
                      <tr>
                        <td className="py-12 text-center text-sm text-gray-400" colSpan={6}>
                          Loading RFQs...
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination footer */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6 text-xs sm:text-sm text-gray-400 font-medium">
            <span>Showing {filteredRfqs.length ? `1-${filteredRfqs.length}` : "0"} of {filteredRfqs.length} RFQs</span>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-lg border border-gray-200 text-gray-300" disabled>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-[#500c56] text-white text-xs font-bold shadow-sm shadow-[#500c56]/10">1</button>
              <button className="p-1.5 rounded-lg border border-gray-200 text-gray-300" disabled>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: RFQ Details Panel */}
        {selectedRfq && (
          <div className="md:col-span-1 sticky top-6 flex flex-col bg-white rounded-[20px] border border-[#eef0f3] overflow-hidden shadow-sm">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-5 py-4 bg-[#500c56] text-white flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/70 font-semibold tracking-wide">Selected Request</span>
                  <span className="text-sm font-bold text-white mt-0.5">RFQ Details â€” {selectedRfq.id}</span>
                  <span className="mt-2 inline-flex w-fit rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold text-white">
                    {selectedRfq.sourcingType || "Sourcing type not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase tracking-wide ${selectedRfq.status === "Approved" ? "bg-[#12b86e]/20 text-[#2ecc71]" :
                      selectedRfq.status === "Pending" ? "bg-[#e39b4d]/20 text-[#e39b4d]" :
                        "bg-[#ee3f43]/20 text-[#ff4d52]"
                    }`}>
                    {selectedRfq.status === "Approved" && <CheckCircle2 className="w-3 h-3" />}
                    {selectedRfq.status === "Pending" && <Clock className="w-3 h-3" />}
                    {selectedRfq.status === "Rejected" && <XCircle className="w-3 h-3" />}
                    {selectedRfq.status}
                  </span>
                  <button
                    onClick={() => setSelectedRfqId(null)}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Body Container */}
              <div className="p-5 space-y-6 flex-1">
                {/* Product Information */}
                <div>
                  <h4 className="border-l-[3px] border-[#500c56] pl-2 font-black text-gray-800 text-[13px]">Product Information</h4>
                  <div className="w-full h-36 rounded-[14px] overflow-hidden mt-3">
                    <img src={selectedRfq.image} alt={selectedRfq.productName} className="w-full h-full object-cover" />
                  </div>
                  <h5 className="text-[14px] font-black text-gray-900 mt-3">{selectedRfq.productName}</h5>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="bg-[#500c56]/10 text-[#500c56] text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {selectedRfq.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      SKU: {selectedRfq.sku}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-2.5 font-medium">
                    {selectedRfq.description}
                  </p>
                </div>

                {/* Quote Details */}
                <div>
                  <h4 className="border-l-[3px] border-[#e39b4d] pl-2 font-black text-gray-800 text-[13px]">Quote Details</h4>
                  <div className="grid grid-cols-3 gap-2.5 mt-3">
                    <div className="bg-[#f8f9fb] rounded-xl p-3 text-center flex flex-col justify-center items-center h-20">
                      <p className="text-[9px] text-[#8c9ba5] font-bold mb-1">Qty Requested</p>
                      <p className="text-xs font-black text-gray-800">{selectedRfq.qtyVal.toLocaleString()}</p>
                      <p className="text-[9px] text-[#8c9ba5] font-medium">{selectedRfq.qtyUnit}</p>
                    </div>
                    <div className="bg-[#fff8f2] rounded-xl p-3 text-center flex flex-col justify-center items-center h-20">
                      <p className="text-[9px] text-[#8c9ba5] font-bold mb-1">Price / Unit</p>
                      <p className="text-xs font-black text-gray-800">SAR {selectedRfq.priceVal.toLocaleString()}</p>
                      <p className="text-[9px] text-[#8c9ba5] font-medium">{selectedRfq.priceUnit}</p>
                    </div>
                    <div className="bg-[#f0fbf7] rounded-xl p-3 text-center flex flex-col justify-center items-center h-20">
                      <p className="text-[9px] text-[#8c9ba5] font-bold mb-1">Total Value</p>
                      <p className="text-xs font-black text-[#12b86e]">{selectedRfq.totalValue}</p>
                      <p className="text-[9px] text-[#8c9ba5] font-medium">Estimated</p>
                    </div>
                  </div>
                </div>

                {/* Additional Services */}
                <div>
                  <h4 className="border-l-[3px] border-[#e39b4d] pl-2 font-black text-gray-800 text-[13px]">Additional Services</h4>
                  <div className="space-y-2 mt-3">
                    {selectedRfq.services.map((service) => (
                      <div
                        className="flex items-center justify-between gap-3 p-3 rounded-[12px] border border-gray-100 bg-[#fafafb]"
                        key={service.name}
                      >
                        <span className="text-[11px] font-semibold text-gray-600">{service.name}</span>
                        <span className="text-[11px] font-bold text-[#e39b4d]">{service.cost}</span>
                      </div>
                    ))}
                    {selectedRfq.services.length === 0 ? (
                      <p className="rounded-[12px] border border-gray-100 bg-[#fafafb] p-3 text-center text-[11px] font-semibold text-gray-400">
                        No additional services selected.
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Business User Information */}
                <div>
                  <h4 className="border-l-[3px] border-[#500c56] pl-2 font-black text-gray-800 text-[13px]">Business User Information</h4>
                  <div className="mt-3 p-4 rounded-[14px] border border-gray-100 shadow-sm bg-[#fafafb] relative">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 overflow-hidden flex items-center justify-center font-bold text-gray-300 text-lg shadow-sm">
                        {selectedBusinessUser?.photo ? (
                          <img
                            src={selectedBusinessUser.photo}
                            alt={selectedUserFullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          selectedUserFullName[0]
                        )}
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <div className="flex items-center justify-between gap-2 w-full">
                          <p className="text-xs font-black text-gray-900">{selectedUserFullName}</p>
                          <span className="bg-[#e2f6ed] text-[#12b86e] text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            {selectedUserRoleType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[9px] text-gray-500 font-medium">
                          <MapPin className="h-2.5 w-2.5 text-gray-400" />
                          {selectedBusinessLocation}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submitted date */}
                  <div className="mt-3 flex items-center justify-between p-3 rounded-[12px] bg-[#f5f6f8] text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500 font-semibold">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-[10px]">Submitted</span>
                    </div>
                    <span className="font-bold text-gray-700 text-[10px]">{selectedRfq.date} at {selectedRfq.time}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex flex-col gap-2 shrink-0">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedRfq.id, "Approved")}
                    className="py-2.5 px-2 bg-[#12b86e] hover:bg-[#109e5f] text-white rounded-[10px] text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedRfq.id, "Rejected")}
                    className="py-2.5 px-2 bg-[#ee3f43] hover:bg-[#d83539] text-white rounded-[10px] text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleEditClick(selectedRfq)}
                    className="py-2.5 px-2 bg-[#d98a29] hover:bg-[#c47c23] text-white rounded-[10px] text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </div>
                <p className="text-[9px] text-center text-gray-400 font-semibold mt-1">Actions are logged and cannot be undone</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Edit RFQ Modal */}
      {isEditModalOpen && selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100">
            <div className="bg-[#500c56] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-400" />
                <h4 className="text-sm font-bold">Edit Quotation Values â€” {selectedRfq.id}</h4>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-white/80 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs">
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
                    onChange={(e) => setEditUnit(e.target.value)}
                    placeholder="Unit"
                    className="w-24 bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Price per Unit */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Price per Unit (SAR)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                  required
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
                  onClick={() => setIsEditModalOpen(false)}
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
      )}
    </div>
  );
}
