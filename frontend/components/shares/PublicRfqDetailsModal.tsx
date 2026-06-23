"use client";

import { CalendarDays, FileText, Globe2, Package, Truck, X } from "lucide-react";
import { useEffect } from "react";

export type PublicRfqDetails = {
  id: number;
  rfq_id: string;
  product_name: string | null;
  product_type: "DOMESTIC" | "INTERNATIONAL" | null;
  category_name?: string | null;
  product_description?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  quantity_required: number;
  unit_name: string;
  target_delivery_date?: string | null;
  preferred_country_name?: string | null;
  additional_service_name?: string | null;
  additional_service_price?: string | number | null;
  additional_details?: string | null;
  attachment?: string | null;
  supplier_name?: string | null;
  supplier_location?: string | null;
  created_at: string;
  updated_at?: string | null;
};

const statusStyles = {
  APPROVED: "bg-[#dff9ee] text-[#059669]",
  PENDING: "bg-[#fff3d6] text-[#d97706]",
  REJECTED: "bg-[#ffe4e6] text-[#dc2626]",
};

const API_MEDIA_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(
  /\/api\/?$/,
  "",
);

function getAttachmentUrl(attachment: string) {
  if (/^https?:\/\//i.test(attachment)) return attachment;
  return `${API_MEDIA_ORIGIN}${attachment.startsWith("/") ? attachment : `/${attachment}`}`;
}

function formatDate(date: string | null | undefined) {
  if (!date) return "Not specified";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PublicRfqDetailsModal({
  onClose,
  rfq,
}: {
  onClose: () => void;
  rfq: PublicRfqDetails | null;
}) {
  useEffect(() => {
    if (!rfq) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, rfq]);

  if (!rfq) return null;

  const status = `${rfq.status.charAt(0)}${rfq.status.slice(1).toLowerCase()}`;
  const sourcing = rfq.product_type === "INTERNATIONAL" ? "International" : "Domestic";

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-[3%]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <section className="flex max-h-[90%] w-[94%] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-[#ece8ed] p-[4%] pb-[3%]">
          <div>
            <div className="flex flex-wrap items-center gap-[3%]">
              <h2 className="text-xl font-bold text-[#111827]">RFQ Details</h2>
              <span className={`rounded-full px-[4%] py-[1%] text-xs font-bold ${statusStyles[rfq.status]}`}>
                {status}
              </span>
            </div>
            <p className="mt-[2%] text-sm font-semibold text-[#65096c]">{rfq.rfq_id}</p>
          </div>
          <button
            aria-label="Close RFQ details"
            className="flex aspect-square w-[8%] items-center justify-center rounded-full text-[#6b7280] transition hover:bg-[#f5f2f5] hover:text-[#65096c] sm:w-[6%]"
            onClick={onClose}
            type="button"
          >
            <X className="w-[50%]" />
          </button>
        </header>

        <div className="overflow-y-auto p-[4%]">
          <div className="grid gap-[4%] sm:grid-cols-2">
            <Detail icon={Package} label="Product" value={rfq.product_name || "Custom RFQ"} />
            <Detail icon={Globe2} label="Sourcing Type" value={sourcing} />
            <Detail label="Category" value={rfq.category_name || "Uncategorized"} />
            <Detail label="Quantity" value={`${rfq.quantity_required.toLocaleString()} ${rfq.unit_name}`} />
            <Detail icon={CalendarDays} label="Date Submitted" value={formatDate(rfq.created_at)} />
            <Detail icon={Truck} label="Target Delivery" value={formatDate(rfq.target_delivery_date)} />
            <Detail label="Preferred Country" value={rfq.preferred_country_name || "Not specified"} />
            <Detail label="Additional Service" value={rfq.additional_service_name || "None"} />
            {rfq.additional_service_price ? (
              <Detail label="Additional Service Price" value={String(rfq.additional_service_price)} />
            ) : null}
            {rfq.supplier_name ? <Detail label="Supplier" value={rfq.supplier_name} /> : null}
            {rfq.supplier_location ? <Detail label="Supplier Location" value={rfq.supplier_location} /> : null}
          </div>

          {rfq.product_description ? (
            <TextDetail label="Product Description" value={rfq.product_description} />
          ) : null}
          <TextDetail label="Additional Details" value={rfq.additional_details || "No additional details provided."} />

          {rfq.attachment ? (
            <a
              className="mt-[4%] inline-flex items-center gap-[6%] rounded-xl border border-[#e5dce6] px-[4%] py-[2%] text-sm font-semibold text-[#65096c] transition hover:bg-[#faf2fb]"
              href={getAttachmentUrl(rfq.attachment)}
              rel="noreferrer"
              target="_blank"
            >
              <FileText className="size-4 shrink-0" />
              View attachment
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-[#eeeeee] pb-[4%]">
      <p className="text-xs font-bold uppercase text-[#9ca3af]">{label}</p>
      <div className="mt-[2%] flex items-center gap-[3%]">
        {Icon ? <Icon className="size-4 shrink-0 text-[#8a8f99]" /> : null}
        <p className="text-sm font-medium text-[#111827]">{value}</p>
      </div>
    </div>
  );
}

function TextDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-[4%] rounded-xl bg-[#f8f9fa] p-[3%]">
      <p className="text-xs font-bold uppercase text-[#9ca3af]">{label}</p>
      <p className="mt-[2%] whitespace-pre-wrap text-sm leading-6 text-[#374151]">{value}</p>
    </div>
  );
}
