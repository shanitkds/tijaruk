"use client";

import Image from "next/image";
import { ClipboardList } from "lucide-react";
import type { UserProduct } from "./userDashboardData";

export default function ProductCard({
  product,
  requested,
  onRequest,
}: {
  product: UserProduct;
  bookmarked: boolean;
  requested: boolean;
  onBookmark: (id: number) => void;
  onRequest: (id: number) => void;
}) {
  const estimatedPrice = product.estimatedPrice
    ? `SAR ${Number(product.estimatedPrice).toLocaleString("en-US")}`
    : "Not added";
  const minimumQuantity = product.minimumQuantity ?? 0;
  const unitName = product.unitName || "Units";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#e8e3e8] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[1.55] bg-[#f8f9fa]">
        {product.image ? (
          <Image
            alt={product.name}
            className="object-cover"
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            src={product.image}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-[#9ca3af]">
            No image
          </span>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${
            product.sourcing === "International" ? "bg-[#65096c]" : "bg-[#e39b4d]"
          }`}
        >
          {product.sourcing}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-2.5 md:p-4">
        <span className="inline-flex rounded-full border border-[#eadfeb] px-2.5 py-1 text-[10px] font-bold text-[#65096c]">
          {product.category}
        </span>
        <h2 className="mt-2 line-clamp-2 min-h-[32px] text-[13px] font-bold leading-4 text-[#111827] md:mt-3 md:min-h-0 md:line-clamp-1 md:text-base md:leading-6">
          {product.name}
        </h2>
        <p className="mt-1 line-clamp-2 min-h-[28px] text-[10px] leading-[14px] text-[#6b7280] md:min-h-[40px] md:text-xs md:leading-5">
          {product.description}
        </p>

        <div className="mt-2 grid gap-1 text-[9px] text-[#6b7280] md:mt-3 md:gap-2 md:text-xs">
          <div className="flex items-center justify-between gap-1.5 md:gap-3">
            <span><span className="md:hidden">Est. Price</span><span className="hidden md:inline">Estimated Price</span></span>
            <b className="text-right text-[#374151]">{estimatedPrice}</b>
          </div>
          <div className="flex items-center justify-between gap-1.5 md:gap-3">
            <span><span className="md:hidden">Min. Qty</span><span className="hidden md:inline">Minimum Quantity</span></span>
            <b className="text-right text-[#374151]">{minimumQuantity.toLocaleString()} {unitName}</b>
          </div>
        </div>

        <button
          className={`mt-3 flex h-9 w-full items-center justify-center gap-1 rounded-lg text-[10px] font-bold text-white transition md:mt-4 md:h-10 md:gap-2 md:text-xs ${
            requested ? "bg-[#65096c]" : "bg-[#e39b4d] hover:bg-[#d88f3f]"
          }`}
          onClick={() => onRequest(product.id)}
          type="button"
        >
          <ClipboardList aria-hidden="true" className="size-3.5 md:size-4" strokeWidth={1.8} />
          {requested ? "RFQ Requested" : "Request RFQ"}
        </button>
      </div>
    </article>
  );
}
