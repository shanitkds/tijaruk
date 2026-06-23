"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Download,
  Eye,
  FileText,
  Filter,
  Globe2,
  MapPin,
  Package,
  Timer,
} from "lucide-react";
import api from "../../../api/axios";
import { dashboardToast } from "../../../components/admin/AdminToast";
import { useUserSearch } from "../../../components/user/UserSearchContext";

type ApiRfq = {
  id: number;
  rfq_id: string;
  product_name: string | null;
  product_image: string | null;
  product_type: "DOMESTIC" | "INTERNATIONAL" | null;
  category_name: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  quantity_required: number;
  unit_name: string;
  created_at: string;
};

type RfqStatus = "Approved" | "Pending" | "Rejected";
type StatusFilter = "All" | RfqStatus;

const statusClass: Record<RfqStatus, string> = {
  Approved: "bg-[#dff9ee] text-[#059669]",
  Pending: "bg-[#fff3d6] text-[#d97706]",
  Rejected: "bg-[#ffe4e6] text-[#dc2626]",
};

const PAGE_SIZE = 7;
const API_MEDIA_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "");

function formatStatus(status: ApiRfq["status"]): RfqStatus {
  return status.charAt(0) + status.slice(1).toLowerCase() as RfqStatus;
}

function getProductImageUrl(image: string | null) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  return `${API_MEDIA_ORIGIN}${image.startsWith("/") ? image : `/${image}`}`;
}

export default function UserRfqsPage() {
  const { searchQuery } = useUserSearch();
  const [rfqs, setRfqs] = useState<ApiRfq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (loadError) dashboardToast.error("Unable to load RFQs", loadError);
  }, [loadError]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    api.get<ApiRfq[]>("/rfqs/")
      .then(({ data }) => {
        if (isMounted) setRfqs(data);
      })
      .catch(() => {
        if (isMounted) setLoadError("Unable to load RFQs. Please refresh the page.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const data = useMemo(() => ({
    total: rfqs.length,
    pending: rfqs.filter((rfq) => rfq.status === "PENDING").length,
    approved: rfqs.filter((rfq) => rfq.status === "APPROVED").length,
    rejected: rfqs.filter((rfq) => rfq.status === "REJECTED").length,
  }), [rfqs]);
  const filteredRfqs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return rfqs.filter((rfq) => {
      const sourcing = rfq.product_type === "INTERNATIONAL" ? "International" : "Domestic";
      const matchesStatus = statusFilter === "All"
        || formatStatus(rfq.status) === statusFilter;
      const matchesSearch = !normalizedQuery || [
        rfq.rfq_id,
        rfq.product_name || "",
        rfq.category_name || "",
        sourcing,
        formatStatus(rfq.status),
        rfq.unit_name,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesSearch;
    });
  }, [rfqs, searchQuery, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredRfqs.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleRfqs = filteredRfqs.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const stats = [
    {
      label: "Total RFQs",
      value: data.total,
      icon: FileText,
      iconClass: "bg-[#f4e7f5] text-[#65096c]",
    },
    {
      label: "Pending",
      value: data.pending,
      icon: Timer,
      iconClass: "bg-[#fff3d6] text-[#e39b4d]",
    },
    {
      label: "Approved",
      value: data.approved,
      icon: CheckCircle2,
      iconClass: "bg-[#dff9ee] text-[#10b981]",
    },
    {
      label: "Rejected",
      value: data.rejected,
      icon: CircleX,
      iconClass: "bg-[#ffe4e6] text-[#ef4444]",
    },
  ];

  return (
    <section className="mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-8 text-[#111827]">My RFQs</h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            Manage and track all your sourcing requests in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#6b7280] transition hover:border-[#d1d5db] hover:text-[#111827]"
            type="button"
          >
            <Download className="size-3.5" strokeWidth={1.8} />
            Export CSV
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#6b7280] transition hover:border-[#d1d5db] hover:text-[#111827]"
            type="button"
          >
            <Filter className="size-3.5" strokeWidth={1.8} />
            Filters
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              className="flex items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white px-5 py-4 shadow-sm"
              key={stat.label}
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}>
                <Icon className="size-4" strokeWidth={2} />
              </span>
              <div>
                <p className="text-xs font-medium text-[#6b7280]">{stat.label}</p>
                <p className="text-xl font-bold leading-6 text-[#111827]">{stat.value}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-5 min-w-0 max-w-full overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#e5e7eb] px-4 pt-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[#111827]">All Requests</h3>
            <button
              className="inline-flex items-center gap-2 text-xs font-medium text-[#6b7280]"
              type="button"
            >
              <CalendarDays className="size-3.5" strokeWidth={1.8} />
              All dates
              <ChevronDown className="size-3" />
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {[
              ["All", data.total],
              ["Pending", data.pending],
              ["Approved", data.approved],
              ["Rejected", data.rejected],
            ].map(([label, count]) => (
              <button
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium ${
                  statusFilter === label
                    ? "border-[#65096c] text-[#65096c]"
                    : "border-transparent text-[#6b7280]"
                }`}
                key={label}
                onClick={() => setStatusFilter(label as StatusFilter)}
                type="button"
              >
                {label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    statusFilter === label ? "bg-[#f4e7f5] text-[#65096c]" : "bg-[#f3f4f6] text-[#6b7280]"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-[#f8f9fa]">
              <tr className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#6b7280]">
                <th className="w-12 px-4 py-3">
                  <input aria-label="Select all RFQs" className="size-4 accent-[#65096c]" type="checkbox" />
                </th>
                <th className="px-4 py-3">RFQ ID</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Sourcing Type</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date Submitted</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {visibleRfqs.map((rfq) => {
                const sourcing = rfq.product_type === "INTERNATIONAL" ? "International" : "Domestic";
                const status = formatStatus(rfq.status);
                const SourcingIcon = sourcing === "International" ? Globe2 : MapPin;
                const productImageUrl = getProductImageUrl(rfq.product_image);

                return (
                  <tr className="text-sm text-[#374151]" key={rfq.id}>
                    <td className="px-4 py-3.5">
                      <input
                        aria-label={`Select RFQ ${rfq.id}`}
                        className="size-4 accent-[#65096c]"
                        type="checkbox"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="whitespace-nowrap rounded-lg bg-[#65096c]/5 px-2.5 py-1 font-mono text-[11px] font-bold text-[#65096c]">
                        {rfq.rfq_id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] text-[#6b7280]">
                          {productImageUrl ? (
                            <img
                              alt={rfq.product_name || "Product"}
                              className="h-full w-full object-cover"
                              src={productImageUrl}
                            />
                          ) : (
                            <Package className="size-4" strokeWidth={1.7} />
                          )}
                        </span>
                        <div>
                          <p className="whitespace-nowrap font-semibold text-[#111827]">{rfq.product_name || "Custom RFQ"}</p>
                          <p className="text-xs text-[#9ca3af]">{rfq.category_name || "Uncategorized"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold ${
                          sourcing === "International"
                            ? "bg-[#65096c]/10 text-[#65096c]"
                            : "bg-[#fff1e6] text-[#e39b4d]"
                        }`}
                      >
                        <SourcingIcon className="size-3" strokeWidth={2} />
                        {sourcing}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs font-bold text-[#111827]">
                      {rfq.quantity_required.toLocaleString()} {rfq.unit_name}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass[status]}`}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-[#6b7280]">
                      {new Date(rfq.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[11px] font-semibold text-[#111827] transition hover:border-[#65096c] hover:text-[#65096c]"
                        type="button"
                      >
                        <Eye className="size-3" strokeWidth={2} />
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && !loadError && visibleRfqs.length === 0 ? (
                <tr>
                  <td className="px-4 py-12 text-center text-sm text-[#6b7280]" colSpan={8}>
                    {searchQuery.trim() ? "No RFQs match your search." : "No RFQs found."}
                  </td>
                </tr>
              ) : null}
              {isLoading ? (
                <tr>
                  <td className="px-4 py-12 text-center text-sm text-[#6b7280]" colSpan={8}>
                    Loading RFQs...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#e5e7eb] px-4 py-4 text-xs text-[#6b7280] sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <p>
            Showing <strong className="text-[#111827]">
              {filteredRfqs.length === 0 ? "0" : `${pageStart + 1}-${Math.min(pageStart + PAGE_SIZE, filteredRfqs.length)}`}
            </strong> of{" "}
            <strong className="text-[#111827]">{filteredRfqs.length}</strong> results
          </p>
          <div className="flex items-center gap-1.5">
            <button
              className="flex size-8 items-center justify-center rounded-lg border border-[#e5e7eb] disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              type="button"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                className={`flex size-8 items-center justify-center rounded-lg font-semibold ${
                  page === currentPage ? "bg-[#65096c] text-white" : "border border-[#e5e7eb] bg-white"
                }`}
                key={page}
                onClick={() => setCurrentPage(page)}
                type="button"
              >
                {page}
              </button>
            ))}
            <button
              className="flex size-8 items-center justify-center rounded-lg border border-[#e5e7eb] disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              type="button"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <button
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 font-semibold text-[#111827]"
              type="button"
            >
              7 <ChevronDown className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
