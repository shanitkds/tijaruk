// @ts-nocheck
"use client";

import React, { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Rfq } from "./RfqManagement";

import RfqDetailsCard from "./rfq-detail/RfqDetailsCard";
import BusinessUserInfoCard from "./rfq-detail/BusinessUserInfoCard";
import SupplierInfoCard from "./rfq-detail/SupplierInfoCard";
import AdditionalServicesCard from "./rfq-detail/AdditionalServicesCard";
import CommunicationHistoryCard from "./rfq-detail/CommunicationHistoryCard";
import RfqStatusCard from "./rfq-detail/RfqStatusCard";
import RfqSummaryCard from "./rfq-detail/RfqSummaryCard";
import RelatedRfqsCard from "./rfq-detail/RelatedRfqsCard";
import StickyActionBar from "./rfq-detail/StickyActionBar";
import EditRfqModal from "./rfq-detail/EditRfqModal";
import SupplierProfileModal from "./rfq-detail/SupplierProfileModal";
import BusinessProfileModal from "./rfq-detail/BusinessProfileModal";
import { adminToast } from "./AdminToast";

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

interface RfqDetailedViewProps {
  rfqId: string;
  rfqList: Rfq[];
  setRfqList: React.Dispatch<React.SetStateAction<Rfq[]>>;
  onBack: () => void;
}

export default function RfqDetailedView({
  rfqId,
  rfqList,
  setRfqList,
  onBack
}: RfqDetailedViewProps) {
  const rfq = rfqList.find((r) => r.id === rfqId) || null;

  // Communication history state
  const [chatInput, setChatInput] = useState("");
  const [customMessages, setCustomMessages] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);
  const attachFileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newEntries = files.map(f => ({
      name: f.name,
      size: f.size < 1024 * 1024
        ? `${(f.size / 1024).toFixed(0)} KB`
        : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setAttachedFiles(prev => [...prev, ...newEntries]);
    e.target.value = "";
  };

  const businessUserEmail = rfq?.businessUser?.email || rfq?.contactEmail || "";
  const isGuestUser = (rfq?.businessUser?.roleType || "").toUpperCase() === "GUEST";

  // Fetch conversation and messages for this RFQ's business user
  useEffect(() => {
    if (!rfq || isGuestUser || !businessUserEmail) return;
    let mounted = true;

    api.get<any[]>("/messages/conversations/")
      .then(({ data }) => {
        if (!mounted) return;
        const conv = data.find((c: any) => c.business_user_email === businessUserEmail);
        if (!conv) return;
        setConversationId(conv.id);

        return api.get<any[]>(`/messages/conversations/${conv.id}/messages/`).then(({ data: msgs }) => {
          if (!mounted) return;
          setCustomMessages(msgs.map((m: any) => ({
            _id: m.id,
            sender: m.sender_name || "Support Team",
            role: m.sender === conv.business_user ? "Business" : "Admin",
            avatar: m.sender === conv.business_user ? (conv.business_user_photo || "") : "",
            time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            content: m.content,
            bgColor: m.sender === conv.business_user ? "bg-gray-50 border border-gray-100" : "bg-white border border-gray-100",
            roleColor: m.sender === conv.business_user ? "text-blue-600 bg-blue-50" : "text-purple-600 bg-purple-50",
          })));
        });
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, [rfq?.id, businessUserEmail, isGuestUser]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editQty, setEditQty] = useState(rfq ? rfq.qtyVal.toString() : "");
  const [editPrice, setEditPrice] = useState(rfq ? rfq.priceVal.toString() : "");
  const [editUnit, setEditUnit] = useState(rfq ? rfq.qtyUnit : "");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSupplierProfileOpen, setIsSupplierProfileOpen] = useState(false);
  const [isBusinessProfileOpen, setIsBusinessProfileOpen] = useState(false);

  if (!rfq) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        RFQ not found. Click <button onClick={onBack} className="text-[#500c56] font-bold underline">here</button> to return.
      </div>
    );
  }

  const allMessages = customMessages;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !conversationId) return;

    const text = chatInput;
    setChatInput("");

    const optimistic = {
      _id: Date.now(),
      sender: "Admin",
      role: "Admin",
      avatar: "",
      time: "Just now",
      content: text,
      bgColor: "bg-white border border-gray-100",
      roleColor: "text-purple-600 bg-purple-50",
    };
    setCustomMessages(prev => [...prev, optimistic]);

    try {
      const { data } = await api.post(`/messages/conversations/${conversationId}/messages/`, { content: text });
      setCustomMessages(prev =>
        prev.map(m =>
          m._id === optimistic._id
            ? { ...optimistic, _id: data.id, time: new Date(data.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), content: data.content }
            : m
        )
      );
    } catch {
      setCustomMessages(prev => prev.filter(m => m._id !== optimistic._id));
    }
  };

  const handleStatusChange = async (newStatus: "Approved" | "Pending" | "Rejected") => {
    setIsUpdatingStatus(true);
    try {
      const { data } = await api.patch(
        `/rfqs/${rfq.apiId}/status/`,
        { status: newStatus.toUpperCase() },
      );
      const savedStatus = data.status.charAt(0) + data.status.slice(1).toLowerCase();
      setRfqList((prev) =>
        prev.map((r) => (
          r.id === rfq.id
            ? {
                ...r,
                status: savedStatus,
                productQuantity: data.product_stock_quantity === null
                  ? "Not tracked"
                  : `${Number(data.product_stock_quantity).toLocaleString()} ${data.product_unit_name || r.qtyUnit}`,
              }
            : r
        ))
      );
      adminToast.success("RFQ updated", `RFQ ${savedStatus.toLowerCase()} successfully.`);
    } catch (error) {
      adminToast.error(
        "Unable to update RFQ",
        getApiErrorMessage(error, "Unable to update RFQ status. Please try again."),
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenEdit = () => {
    setEditQty(rfq.qtyVal.toString());
    setEditPrice(rfq.priceVal.toString());
    setEditUnit(rfq.qtyUnit);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(editQty) || 0;
    const price = parseFloat(editPrice) || 0;
    const total = qty * price;

    let formattedTotal = `SAR ${(total).toLocaleString()}`;
    if (total >= 1000000) {
      formattedTotal = `SAR ${(total / 1000000).toFixed(1)}M`;
    } else if (total >= 1000) {
      formattedTotal = `SAR ${(total / 1000).toFixed(0)}K`;
    }

    try {
      await api.patch(`/rfqs/${rfq.apiId}/`, {
        quantity_required: qty,
        unit: rfq.unitId,
      });
      setRfqList((prev) =>
        prev.map((r) => {
          if (r.id === rfq.id) {
            return {
              ...r,
              qtyVal: qty,
              priceVal: price,
              quantity: `${qty.toLocaleString()} ${r.qtyUnit}`,
              pricePerUnit: price ? `SAR ${price.toLocaleString()}` : "Not provided",
              totalValue: price ? formattedTotal : r.totalValue,
              status: "Pending",
            };
          }
          return r;
        })
      );
      setIsEditModalOpen(false);
      adminToast.success("RFQ updated", "The RFQ details were saved successfully.");
    } catch {
      adminToast.error("Unable to update RFQ", "Please try again.");
    }
  };

  // 3 related RFQs
  const relatedRfqs = rfqList
    .filter((r) => r.id !== rfq.id)
    .slice(0, 3);

  // Dynamic phone and email
  const supplierEmail = rfq.supplier.email;
  const supplierPhone = rfq.supplier.phone;
  const businessUser = rfq.businessUser || {
    businessName: rfq.businessName || "Not provided",
    contactPerson: rfq.contactPerson || "Not provided",
    email: rfq.contactEmail || "Not provided",
    businessEmail: rfq.contactEmail || "Not provided",
    phone: rfq.contactPhone || "Not provided",
    businessPhone: rfq.contactPhone || "Not provided",
    industry: rfq.contactIndustry || "Not provided",
    location: rfq.contactLocation || "Not provided",
  };
  const deadlineDate = rfq.dueDate || "Not provided";

  return (
    <div className="pb-28">
      {/* Dynamic Breadcrumbs Back Header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#500c56] font-semibold transition-colors bg-white border border-gray-100 rounded-lg px-2.5 py-1.5 shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to RFQ List</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column - Wider (70% on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <RfqDetailsCard rfq={rfq} />
          <BusinessUserInfoCard
            businessUser={businessUser}
            onViewProfile={() => setIsBusinessProfileOpen(true)}
          />
          <SupplierInfoCard
            rfq={rfq}
            supplierEmail={supplierEmail}
            supplierPhone={supplierPhone}
            onViewProfile={() => setIsSupplierProfileOpen(true)}
          />
          <AdditionalServicesCard rfq={rfq} />
          {!isGuestUser && (
            <CommunicationHistoryCard
              allMessages={allMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              attachedFiles={attachedFiles}
              setAttachedFiles={setAttachedFiles}
              attachFileInputRef={attachFileInputRef}
              handleAttachFiles={handleAttachFiles}
              handleSendMessage={handleSendMessage}
            />
          )}
        </div>

        {/* Right Column - Sidebar (30% on desktop) */}
        <div className="lg:col-span-1 space-y-6">
          <RfqStatusCard rfq={rfq} deadlineDate={deadlineDate} />
          <RfqSummaryCard rfq={rfq} />
          <RelatedRfqsCard relatedRfqs={relatedRfqs} onBack={onBack} />
        </div>
      </div>

      <StickyActionBar
        rfq={rfq}
        isUpdatingStatus={isUpdatingStatus}
        statusMessage=""
        statusError=""
        onOpenEdit={handleOpenEdit}
        onStatusChange={handleStatusChange}
      />

      {isEditModalOpen && (
        <EditRfqModal
          rfq={rfq}
          editQty={editQty}
          setEditQty={setEditQty}
          editPrice={editPrice}
          editUnit={editUnit}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}

      {isSupplierProfileOpen && (
        <SupplierProfileModal
          rfq={rfq}
          onClose={() => setIsSupplierProfileOpen(false)}
        />
      )}

      {isBusinessProfileOpen && (
        <BusinessProfileModal
          businessUser={businessUser}
          onClose={() => setIsBusinessProfileOpen(false)}
        />
      )}
    </div>
  );
}
