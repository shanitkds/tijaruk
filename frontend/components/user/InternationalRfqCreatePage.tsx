"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  CloudUpload,
  FileArchive,
  FileImage,
  FileText,
  Globe2,
  Lightbulb,
  LockKeyhole,
  PencilRuler,
  ShieldCheck,
  Target,
  Trash2,
  Upload,
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

const acceptedFileTypes = [
  { label: "PDF", color: "text-[#ef4444]" },
  { label: "DOCX", color: "text-[#2563eb]" },
  { label: "PNG / JPG", color: "text-[#16a34a]" },
  { label: "DWG / DXF", color: "text-[#e39b4d]" },
];

export default function InternationalRfqCreatePage({ product }: { product: UserProduct | null }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("");
  const [unitId, setUnitId] = useState(product?.unitId ? String(product.unitId) : "");
  const [unitOptions, setUnitOptions] = useState<RfqLookupOption[]>([]);
  const [countryOptions, setCountryOptions] = useState<RfqLookupOption[]>([]);
  const [budget, setBudget] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [origin, setOrigin] = useState("");
  const [details, setDetails] = useState("");
  const [isInternationalSourcingIncluded, setIsInternationalSourcingIncluded] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showAllServices, setShowAllServices] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (submitError) dashboardToast.error("Unable to submit RFQ", submitError);
  }, [submitError]);

  useEffect(() => {
    let isMounted = true;

    loadRfqLookups()
      .then(({ units, countries }) => {
        if (!isMounted) return;
        setUnitOptions(units);
        setCountryOptions(countries);
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
          setSubmitError("Unable to load RFQ options. Please refresh the page.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [product?.unitName]);

  const completion = useMemo(() => {
    const completedFields = [
      product,
      quantity.trim(),
      budget.trim(),
      deliveryDate,
      origin,
      details.trim(),
      isInternationalSourcingIncluded,
      uploadedFiles.length > 0,
    ].filter(Boolean).length;

    return Math.round((completedFields / 8) * 100);
  }, [
    budget,
    deliveryDate,
    details,
    isInternationalSourcingIncluded,
    origin,
    product,
    quantity,
    uploadedFiles.length,
  ]);

  const productServices = useMemo(
    () =>
      (product?.services || []).map((service) => ({
        id: String(service.id),
        title: service.name,
        description: service.description,
      })),
    [product?.services],
  );
  const visibleProductServices = showAllServices ? productServices : productServices.slice(0, 3);
  const selectedServiceItems = productServices.filter((service) =>
    selectedServices.includes(service.id),
  );
  const summaryBudget = budget.trim()
    ? `SAR ${Number(budget).toLocaleString("en-US")}`
    : "Not added";
  const productName = product?.name ?? "Product not found";
  const productCategory = product?.category ?? "International Product";
  const productImage = product?.image ?? "/products/hero.webp";
  const selectedUnit = unitOptions.find((option) => String(option.id) === unitId);
  const unitName = selectedUnit?.name || product?.unitName || "Units";
  const minimumQuantity = product?.minimumQuantity ?? 0;
  const estimatedPrice = product?.estimatedPrice
    ? `SAR ${Number(product.estimatedPrice).toLocaleString("en-US")}`
    : "Not added";
  const selectedCountry = countryOptions.find((option) => String(option.id) === origin);
  const minimumDeliveryDate = new Date().toISOString().slice(0, 10);

  async function submitRfq() {
    setSubmitError("");

    if (!product || !quantity || Number(quantity) <= 0 || !unitId || !deliveryDate || !budget) {
      setSubmitError("Product, quantity, unit, budget, and target delivery date are required.");
      return;
    }

    if (minimumQuantity > 0 && Number(quantity) < minimumQuantity) {
      setSubmitError(`Quantity must be greater than or equal to ${minimumQuantity.toLocaleString()} ${unitName}.`);
      return;
    }

    const payload = new FormData();
    payload.append("product", String(product.id));
    payload.append("quantity_required", quantity);
    payload.append("unit", unitId);
    payload.append("target_delivery_date", deliveryDate);
    if (origin) {
      payload.append("preferred_country_of_origin", origin);
    }
    payload.append(
      "additional_details",
      [`Expected budget: SAR ${budget.trim()}`, details.trim()].filter(Boolean).join("\n\n"),
    );
    if (selectedServices[0]) {
      payload.append("additional_service", selectedServices[0]);
    }
    if (uploadedFiles[0]) {
      payload.append("attachment", uploadedFiles[0]);
    }

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
      <div className="mb-5 flex items-center gap-2 text-xs font-medium text-[#6b7280]">
        <Link className="transition hover:text-[#65096c]" href="/user/products">
          Products
        </Link>
        <span>/</span>
        <span>International RFQ</span>
        <span>/</span>
        <span className="font-bold text-[#111827]">Submit RFQ</span>
      </div>

      <div className="mb-5">
        <h1 className="text-2xl font-bold leading-8 text-[#111827]">Submit RFQ</h1>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
            <div className="flex flex-col md:flex-row">
              <div className="relative h-52 bg-[#eef0f2] md:h-auto md:w-52">
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
                      <Globe2 aria-hidden="true" className="size-3" />
                      International Sourcing
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
                    { label: "ISO 9001 Certified", icon: BadgeCheck, className: "bg-[#eff6ff] text-[#2563eb]" },
                    { label: "Global Shipping", icon: Globe2, className: "bg-[#faf5ff] text-[#9333ea]" },
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
                  Specify the quantity and your expected budget for this order
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
                <span className="text-[11px] text-[#9ca3af]">Minimum order quantity: 1 unit</span>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#374151]">
                  Expected Price / Budget (SAR) <b className="text-[#ef4444]">*</b>
                </span>
                <div className="flex overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f8f9fa]">
                  <span className="flex w-14 items-center justify-center text-xs font-bold text-[#6b7280]">
                    SAR
                  </span>
                  <input
                    className="h-12 min-w-0 flex-1 bg-transparent text-sm font-medium text-[#111827] outline-none"
                    min="0"
                    onChange={(event) => setBudget(event.target.value)}
                    type="number"
                    value={budget}
                  />
                  <span className="flex w-16 items-center justify-center border-l border-[#e5e7eb] text-xs font-medium text-[#6b7280]">
                    SAR
                  </span>
                </div>
                <span className="text-[11px] text-[#9ca3af]">
                  Enter your target price per unit or total budget
                </span>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#374151]">Target Delivery Date</span>
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

              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#374151]">
                  Preferred Country of Origin <b className="text-[#9ca3af]">(Optional)</b>
                </span>
                <div className="relative">
                  <Globe2
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6b7280]"
                  />
                  <select
                    className="h-12 w-full appearance-none rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] pl-11 pr-10 text-sm font-medium text-[#111827] outline-none"
                    onChange={(event) => setOrigin(event.target.value)}
                    value={origin}
                  >
                    <option value="">Select origin</option>
                    {countryOptions.map((option) => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#6b7280]"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] pb-5">
              <div className="flex gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff3d6] text-[#e39b4d]">
                  <Lightbulb aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#111827]">Additional Services</h2>
                  <p className="text-xs text-[#6b7280]">Enhance your order with premium add-on services</p>
                </div>
              </div>
              {isInternationalSourcingIncluded ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f0fdf4] px-3 py-1 text-xs font-bold text-[#16a34a]">
                  <CheckCircle2 aria-hidden="true" className="size-3" />
                  Sourcing included
                </span>
              ) : null}
            </div>

            <div className="mt-5 rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#f4e7f5] text-[#65096c]">
                    <Target aria-hidden="true" className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">International Sourcing</h3>
                    <p className="text-xs text-[#6b7280]">
                      Finding and vetting global suppliers on your behalf is always included.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.5px] text-[#6b7280]">
              Select optional add-ons
            </p>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              {visibleProductServices.map((service) => {
                const selected = selectedServices.includes(service.id);

                return (
                  <button
                    className={`relative min-h-[168px] rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-[#65096c] bg-[#fff9ff] shadow-sm"
                        : "border-[#e5e7eb] bg-white hover:border-[#c7a5ca]"
                    }`}
                    key={service.id}
                    onClick={() =>
                      setSelectedServices((current) =>
                        current.includes(service.id)
                          ? []
                          : [service.id],
                      )
                    }
                    type="button"
                  >
                    <span className="block text-sm font-bold text-[#65096c]">{service.title}</span>
                    <span className="mt-2 block text-xs leading-5 text-[#6b7280]">
                      {service.description || "No description provided."}
                    </span>
                    {selected ? (
                      <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border border-[#65096c] bg-[#65096c] text-white">
                        <Check aria-hidden="true" className="size-3" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {productServices.length > 3 ? (
              <button
                className="mt-4 inline-flex rounded-lg border border-[#65096c] bg-white px-4 py-2 text-xs font-bold text-[#65096c] transition hover:bg-[#fff7ff]"
                onClick={() => setShowAllServices((current) => !current)}
                type="button"
              >
                {showAllServices ? "Show less" : `More services (${productServices.length - 3})`}
              </button>
            ) : null}
            {productServices.length === 0 ? (
              <p className="mt-3 rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] p-4 text-xs font-semibold text-[#6b7280]">
                No optional services are available for this product.
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex gap-3 border-b border-[#e5e7eb] pb-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]">
                <PencilRuler aria-hidden="true" className="size-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#111827]">Additional Details</h2>
                <p className="text-xs text-[#6b7280]">
                  Provide technical specifications, requirements, and branding needs
                </p>
              </div>
            </div>
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-[#374151]">
                Requirements, Product Specifications & Branding Needs
              </span>
              <textarea
                className="mt-2 min-h-[168px] w-full resize-none rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] p-4 text-sm leading-6 text-[#111827] outline-none focus:border-[#65096c]"
                maxLength={2000}
                onChange={(event) => setDetails(event.target.value)}
                value={details}
              />
            </label>
            <div className="mt-2 flex items-center justify-between text-[11px] text-[#9ca3af]">
              <span>The more detail you provide, the more accurate quotes you will receive</span>
              <span>{details.length} / 2000</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] pb-5">
              <div className="flex gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#16a34a]">
                  <Upload aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#111827]">File Upload</h2>
                  <p className="text-xs text-[#6b7280]">
                    Attach reference images, technical drawings, or documents
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-[#e5e7eb] px-3 py-1 text-xs font-medium text-[#9ca3af]">
                Optional
              </span>
            </div>

            <label className="mt-5 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#65096c] bg-[#fffaff] p-6 text-center">
              <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#f4e7f5] text-[#65096c]">
                <CloudUpload aria-hidden="true" className="size-5" />
              </span>
              <span className="text-sm font-bold text-[#111827]">Upload reference images or documents</span>
              <span className="mt-1 text-xs text-[#6b7280]">Drag & drop files here, or browse from your device</span>
              <span className="mt-3 flex flex-wrap justify-center gap-3">
                {acceptedFileTypes.map((type) => (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${type.color}`} key={type.label}>
                    <FileText aria-hidden="true" className="size-3" />
                    {type.label}
                  </span>
                ))}
              </span>
              <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#65096c] px-4 py-2 text-xs font-bold text-white">
                <Upload aria-hidden="true" className="size-3.5" />
                Choose Files
              </span>
              <span className="mt-3 text-[11px] text-[#9ca3af]">Max 25MB - one attachment</span>
              <input
                className="sr-only"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  setUploadedFiles(files.slice(0, 1));
                  event.target.value = "";
                }}
                type="file"
              />
            </label>

            {uploadedFiles.length > 0 ? (
              <div className="mt-4 space-y-3">
                {uploadedFiles.map((file, index) => {
                  const isImage = file.type.includes("image");
                  const isZip = file.name.toLowerCase().endsWith(".zip");
                  const FileIcon = isImage ? FileImage : isZip ? FileArchive : FileText;

                  return (
                    <div
                      className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] p-3"
                      key={`${file.name}-${file.lastModified}-${index}`}
                    >
                      <span className="flex size-9 items-center justify-center rounded-lg bg-white text-[#65096c]">
                        <FileIcon aria-hidden="true" className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#374151]">{file.name}</p>
                        <p className="text-xs text-[#9ca3af]">
                          {(file.size / 1024 / 1024).toFixed(2)} MB - Uploaded just now
                        </p>
                      </div>
                      <span className="hidden items-center gap-1 text-xs font-bold text-[#16a34a] sm:flex">
                        <CheckCircle2 aria-hidden="true" className="size-3" />
                        Ready
                      </span>
                      <button
                        aria-label={`Remove ${file.name}`}
                        className="flex size-8 items-center justify-center rounded-lg text-[#9ca3af] transition hover:bg-white hover:text-[#ef4444]"
                        onClick={() =>
                          setUploadedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
                        }
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="rounded-xl border border-[#f3e8ff] bg-[#fff7ff] p-4">
              <div className="flex gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#f4e7f5] text-[#65096c]">
                  <LockKeyhole aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#65096c]">Review & Approval Process</h2>
                  <p className="mt-1 text-xs leading-5 text-[#6b7280]">
                    Your RFQ will be reviewed by the TIJARUK admin team. You will be notified by email and
                    in-app notification after approval. Typical review time is 24-48 business hours.
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
                  <Upload aria-hidden="true" className="size-4" />
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
                ["Sourcing", "International"],
                ["Quantity", quantity.trim() ? `${quantity} ${unitName}` : "Not added"],
                ["Budget", summaryBudget],
                ["Delivery", deliveryDate || "Not selected"],
                ["Origin", selectedCountry?.name || "Not selected"],
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

            <div className="mt-4 border-b border-[#e5e7eb] pb-4">
              <h3 className="text-xs font-bold text-[#374151]">Selected Add-ons</h3>
              <div className="mt-3 space-y-2">
                {isInternationalSourcingIncluded ? (
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-2 text-[#374151]">
                      <CheckCircle2 aria-hidden="true" className="size-3 text-[#65096c]" />
                      International Sourcing
                    </span>
                    <b className="rounded-full bg-[#f0fdf4] px-2 py-0.5 text-[10px] text-[#16a34a]">FREE</b>
                  </div>
                ) : null}
                {selectedServiceItems.map((service) => (
                  <div className="flex items-center justify-between gap-2 text-xs" key={service.id}>
                    <span className="inline-flex items-center gap-2 text-[#374151]">
                      <CheckCircle2 aria-hidden="true" className="size-3 text-[#65096c]" />
                      {service.title}
                    </span>
                    <b className="text-[10px] text-[#6b7280]">On Request</b>
                  </div>
                ))}
                {!isInternationalSourcingIncluded && selectedServiceItems.length === 0 ? (
                  <p className="text-xs text-[#9ca3af]">No add-ons selected</p>
                ) : null}
              </div>
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
                  title: "Be Specific",
                  text: "Include exact dimensions, tolerances, certifications, and materials needed.",
                  icon: PencilRuler,
                  className: "bg-[#fff3d6] text-[#e39b4d]",
                },
                {
                  title: "Attach Drawings",
                  text: "Technical drawings and spec sheets lead to far more precise quotations.",
                  icon: FileText,
                  className: "bg-[#eff6ff] text-[#2563eb]",
                },
                {
                  title: "Allow Enough Lead Time",
                  text: "60-90 days gives international suppliers time to offer competitive pricing.",
                  icon: ShieldCheck,
                  className: "bg-[#f0fdf4] text-[#16a34a]",
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
