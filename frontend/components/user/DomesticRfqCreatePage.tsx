"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Leaf,
  Lightbulb,
  PackageCheck,
  Send,
  Truck,
  X,
} from "lucide-react";
import {
  createRfq,
  getRfqErrorMessage,
  loadRfqLookups,
  type RfqLookupOption,
} from "../../lib/rfqApi";
import type { UserProduct } from "./userDashboardData";
import { dashboardToast } from "../admin/AdminToast";

export default function DomesticRfqCreatePage({ product }: { product: UserProduct | null }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("");
  const [unitId, setUnitId] = useState(product?.unitId ? String(product.unitId) : "");
  const [unitOptions, setUnitOptions] = useState<RfqLookupOption[]>([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (submitError) dashboardToast.error("Unable to submit RFQ", submitError);
  }, [submitError]);

  useEffect(() => {
    let isMounted = true;

    loadRfqLookups()
      .then(({ units }) => {
        if (!isMounted) return;
        setUnitOptions(units);
        setUnitId((current) => {
          if (current && units.some((option) => String(option.id) === current)) {
            return current;
          }

          const matchingUnit = units.find(
            (option) => option.name.toLowerCase() === product?.unitName?.toLowerCase(),
          );
          return String(matchingUnit?.id ?? units[0]?.id ?? "");
        });
      })
      .catch(() => {
        if (isMounted) {
          setSubmitError("Unable to load RFQ units. Please refresh the page.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [product?.unitName]);

  const completion = useMemo(() => {
    const completedFields = [product, quantity.trim(), unitId, deliveryDate, budget.trim(), notes.trim()].filter(Boolean).length;

    return Math.round((completedFields / 6) * 100);
  }, [budget, deliveryDate, notes, product, quantity, unitId]);

  const productName = product?.name ?? "Product not found";
  const productCategory = product?.category ?? "Domestic Product";
  const productImage = product?.image ?? "/products/hero.webp";
  const summaryBudget = budget.trim() ? `SAR ${Number(budget).toLocaleString("en-US")}` : "Not added";
  const selectedUnit = unitOptions.find((option) => String(option.id) === unitId);
  const unitName = selectedUnit?.name || product?.unitName || "Units";
  const minimumQuantity = product?.minimumQuantity ?? 0;
  const estimatedPrice = product?.estimatedPrice
    ? `SAR ${Number(product.estimatedPrice).toLocaleString("en-US")}`
    : "Not added";
  const minimumDeliveryDate = new Date().toISOString().slice(0, 10);

  async function submitRfq() {
    setSubmitError("");

    if (!product || !quantity || Number(quantity) <= 0 || !unitId || !deliveryDate) {
      setSubmitError("Product, quantity, unit, and target delivery date are required.");
      return;
    }

    if (minimumQuantity > 0 && Number(quantity) < minimumQuantity) {
      setSubmitError(`Quantity must be greater than or equal to ${minimumQuantity.toLocaleString()} ${unitName}.`);
      return;
    }

    const additionalDetails = [
      budget.trim() ? `Expected budget: SAR ${budget.trim()}` : "",
      notes.trim(),
    ].filter(Boolean).join("\n\n");
    const payload = new FormData();
    payload.append("product", String(product.id));
    payload.append("quantity_required", quantity);
    payload.append("unit", unitId);
    payload.append("target_delivery_date", deliveryDate);
    payload.append("additional_details", additionalDetails);
    payload.append(
      "additional_services",
      JSON.stringify({
        international_sourcing: false,
        white_labeling: false,
        business_consultancy: false,
        branding_growth_support: false,
      }),
    );

    setIsSubmitting(true);
    try {
      await createRfq(payload);
      dashboardToast.success("RFQ submitted", "Your sourcing request was submitted successfully.");
      router.push("/user/rfqs");
    } catch (error) {
      setSubmitError(getRfqErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium text-[#6b7280]">
        <Link className="transition hover:text-[#65096c]" href="/user/products">
          Products
        </Link>
        <span>/</span>
        <span>{productName}</span>
        <span>/</span>
        <span className="font-bold text-[#65096c]">Submit RFQ</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold leading-8 text-[#111827]">Submit RFQ</h1>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
            <div className="flex flex-col md:flex-row">
              <div className="relative h-52 bg-[#f8f9fa] md:h-auto md:w-52">
                <Image alt={productName} className="object-cover" fill sizes="208px" src={productImage} />
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.6px] text-[#6b7280]">
                        {productCategory}
                      </p>
                      <h2 className="mt-1 text-lg font-bold leading-6 text-[#111827]">{productName}</h2>
                    </div>
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#65096c] px-3 py-1.5 text-xs font-bold text-white">
                      <PackageCheck aria-hidden="true" className="size-3" />
                      Domestic
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#6b7280]">
                    <span>
                      Minimum Quantity: <b className="text-[#374151]">{minimumQuantity.toLocaleString()} {unitName}</b>
                    </span>
                    <span>
                      Category: <b className="text-[#374151]">{productCategory}</b>
                    </span>
                    <span>
                      Estimated Price: <b className="text-[#374151]">{estimatedPrice}</b>
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-[#e5e7eb] pt-4">
                  {[
                    { label: "In Stock", icon: CheckCircle2, className: "bg-[#f0fdf4] text-[#16a34a]" },
                    {
                      label: product?.category === "Food & Beverage" ? "Organic Certified" : "Quality Certified",
                      icon: product?.category === "Food & Beverage" ? Leaf : BadgeCheck,
                      className: "bg-[#fff7ed] text-[#e39b4d]",
                    },
                    { label: "Domestic Shipping", icon: Truck, className: "bg-[#faf5ff] text-[#9333ea]" },
                  ].map((badge) => {
                    const BadgeIcon = badge.icon;

                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${badge.className}`}
                        key={badge.label}
                      >
                        <BadgeIcon aria-hidden="true" className="size-3" />
                        {badge.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex gap-3 border-b border-[#e5e7eb] pb-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#f4e7f5] text-[#65096c]">
                <ClipboardList aria-hidden="true" className="size-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#111827]">Quantity & Pricing</h2>
                <p className="text-xs text-[#6b7280]">
                  Specify the quantity required and your expected budget for this order
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#374151]">
                  Quantity Required <b className="text-[#ef4444]">*</b>
                </span>
                <div className="flex overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f8f9fa]">
                  <input
                    className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm font-medium text-[#111827] outline-none"
                    min="1"
                    onChange={(event) => setQuantity(event.target.value)}
                    type="number"
                    value={quantity}
                  />
                  <span className="flex w-24 items-center justify-center border-l border-[#e5e7eb] text-sm font-medium text-[#374151]">
                    {unitName}
                  </span>
                </div>
                <span className="text-[11px] text-[#9ca3af]">Minimum order quantity: 1 {unitName}</span>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#374151]">
                  Expected Price / Budget <b className="font-medium text-[#9ca3af]">(Optional)</b>
                </span>
                <div className="flex overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f8f9fa]">
                  <span className="flex w-16 items-center justify-center border-r border-[#e5e7eb] text-xs font-bold text-[#374151]">
                    SAR
                  </span>
                  <input
                    className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm font-medium text-[#111827] outline-none"
                    min="0"
                    onChange={(event) => setBudget(event.target.value)}
                    type="number"
                    value={budget}
                  />
                  <span className="flex w-16 items-center justify-center border-l border-[#e5e7eb] text-xs font-medium text-[#6b7280]">
                    / {unitName}
                  </span>
                </div>
                <span className="text-[11px] text-[#9ca3af]">
                  Enter your target price per unit or total budget
                </span>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#374151]">
                  Target Delivery Date <b className="text-[#ef4444]">*</b>
                </span>
                <div className="relative">
                  <CalendarDays
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6b7280]"
                  />
                  <input
                    className="h-12 w-full rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] pl-11 pr-4 text-sm font-medium text-[#111827] outline-none"
                    min={minimumDeliveryDate}
                    onChange={(event) => setDeliveryDate(event.target.value)}
                    type="date"
                    value={deliveryDate}
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex gap-3 border-b border-[#e5e7eb] pb-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]">
                <FileText aria-hidden="true" className="size-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#111827]">Additional Notes</h2>
                <p className="text-xs text-[#6b7280]">
                  Share any specific requirements or preferences with the supplier
                </p>
              </div>
            </div>
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-[#374151]">
                Any specific requirements or notes for the supplier{" "}
                <b className="font-medium text-[#9ca3af]">(Optional)</b>
              </span>
              <textarea
                className="mt-2 min-h-[190px] w-full resize-none rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] p-4 text-sm leading-6 text-[#111827] outline-none focus:border-[#65096c]"
                maxLength={2000}
                onChange={(event) => setNotes(event.target.value)}
                value={notes}
              />
            </label>
            <div className="mt-2 flex items-center justify-between text-[11px] text-[#9ca3af]">
              <span>More detail helps the supplier respond with accurate availability and pricing</span>
              <span>{notes.length} / 2000</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="rounded-xl border border-[#f3e8ff] bg-[#fff7ff] p-4">
              <div className="flex gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#f4e7f5] text-[#65096c]">
                  <Bell aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#65096c]">Review & Approval Process</h2>
                  <p className="mt-1 text-xs leading-5 text-[#6b7280]">
                    Your RFQ will be reviewed by admin. You will be notified after approval. Typical
                    review time is 24-48 business hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link className="inline-flex items-center gap-1 text-xs font-semibold text-[#6b7280]" href="/user/products">
                <X aria-hidden="true" className="size-3" />
                Cancel
              </Link>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-5 text-xs font-bold text-[#374151]"
                  type="button"
                >
                  <FileText aria-hidden="true" className="size-4" />
                  Save as Draft
                </button>
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#e39b4d] px-6 text-xs font-bold text-white transition hover:bg-[#d88f3f] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting || !product}
                  onClick={submitRfq}
                  type="button"
                >
                  <Send aria-hidden="true" className="size-4" />
                  {isSubmitting ? "Submitting..." : "Submit RFQ"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
              <ClipboardList aria-hidden="true" className="size-4 text-[#65096c]" />
              RFQ Summary
            </h2>
            <div className="mt-5 space-y-3 border-b border-[#e5e7eb] pb-4 text-xs">
              {[
                ["Product", productName],
                ["Category", productCategory],
                ["Sourcing", "Domestic"],
                ["Quantity", quantity.trim() ? `${quantity} ${unitName}` : "Not added"],
                ["Budget", summaryBudget],
                ["Delivery", deliveryDate || "Not selected"],
              ].map(([label, value]) => (
                <div className="flex items-start justify-between gap-3" key={label}>
                  <span className="text-[#6b7280]">{label}</span>
                  <span
                    className={`max-w-[150px] text-right font-bold ${
                      label === "Sourcing"
                        ? "rounded-full bg-[#65096c] px-2 py-0.5 text-white"
                        : "text-[#111827]"
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#374151]">Form Completion</span>
                <span className="text-[#65096c]">{completion}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[#f8f9fa]">
                <div className="h-2 rounded-full bg-[#65096c]" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-2 text-[11px] leading-4 text-[#9ca3af]">
                Almost complete - review your details before submitting.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
              <Lightbulb aria-hidden="true" className="size-4 text-[#e39b4d]" />
              Tips for Better Quotes
            </h2>
            <div className="mt-5 space-y-4">
              {[
                {
                  title: "Specify the Variety",
                  text: "Mention the exact variety or grade needed, including quality notes.",
                  icon: Leaf,
                  className: "bg-[#fff3d6] text-[#e39b4d]",
                },
                {
                  title: "Include Certifications",
                  text: "Mention local, halal, organic, or safety certifications when needed.",
                  icon: CheckCircle2,
                  className: "bg-[#f0fdf4] text-[#16a34a]",
                },
                {
                  title: "Define Packaging",
                  text: "Bulk vs. retail packaging affects cost significantly, so be specific.",
                  icon: PackageCheck,
                  className: "bg-[#eff6ff] text-[#2563eb]",
                },
              ].map((tip) => {
                const Icon = tip.icon;

                return (
                  <div className="flex gap-3" key={tip.title}>
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tip.className}`}>
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-[#1f2937]">{tip.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-[#6b7280]">{tip.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {!product ? (
            <div className="rounded-2xl border border-[#fee2e2] bg-[#fff7f7] p-4 text-sm font-semibold text-[#b91c1c]">
              This product id was not found in the products data file.
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
