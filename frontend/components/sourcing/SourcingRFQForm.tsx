// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import api from "../../api/axios";
import {
  createRfq,
  getRfqErrorMessage,
  loadRfqLookups,
} from "../../lib/rfqApi";
import { getAuthSession } from "../../lib/auth";
import SourcingAuthModal from "./SourcingAuthModal";

const serviceOptions = [
  { value: "white-labeling", label: "White Labeling" },
  { value: "business-consultancy", label: "Business Consultancy" },
  { value: "branding-growth", label: "Branding and Growth" },
];

export default function SourcingRFQForm() {
  const [products, setProducts] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [productId, setProductId] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [service, setService] = useState("");
  const [quantity, setQuantity] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const toastTimerRef = useRef(null);
  const fieldClass =
    "h-[46px] w-full rounded-[7px] border border-[#d0d0d0] bg-white px-3 font-['Poppins',sans-serif] text-[12px] text-[#202020] outline-none placeholder:text-[#777777] focus:border-[#6d0870]";
  const selectClass = `${fieldClass} appearance-none pr-10 text-[#777777]`;
  const labelClass =
    "mb-2 block font-['Poppins',sans-serif] text-[13px] font-normal leading-none text-black";
  const selectArrow = (
    <span className="pointer-events-none absolute right-4 top-[37px] h-2.5 w-2.5 rotate-45 border-b-2 border-r-2 border-[#5f5f5f]" />
  );
  const minimumTargetDate = new Date().toISOString().slice(0, 10);

  function showToast(type, message) {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4500);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadFormData() {
      try {
        const [{ data: domesticProducts }, { data: internationalProducts }, { units }] = await Promise.all([
          api.get("/products/public/domestic/", { skipAuth: true, skipAuthRedirect: true }),
          api.get("/products/public/international/", { skipAuth: true, skipAuthRedirect: true }),
          loadRfqLookups({ skipAuth: true, skipAuthRedirect: true }),
        ]);

        if (!isMounted) {
          return;
        }

        setProducts([
          ...domesticProducts.map((product) => ({
            ...product,
            product_type: "DOMESTIC",
          })),
          ...internationalProducts.map((product) => ({
            ...product,
            product_type: "INTERNATIONAL",
          })),
        ]);
        setUnitOptions(units);
      } catch {
        if (isMounted) {
          setLoadError("Unable to load products. Please refresh the page.");
        }
      }
    }

    loadFormData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!products.length) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedProductId = params.get("product");
    const requestedType = params.get("type");
    const normalizedType =
      requestedType === "DOMESTIC" || requestedType === "INTERNATIONAL"
        ? requestedType
        : "";

    if (normalizedType) {
      setSourceType(normalizedType);
    }

    if (requestedProductId) {
      const matchingProduct = products.find(
        (product) =>
          String(product.id) === requestedProductId &&
          (!normalizedType || product.product_type === normalizedType),
      );

      if (matchingProduct) {
        setProductId(String(matchingProduct.id));
        setSourceType(matchingProduct.product_type);
      }
    }
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!sourceType) {
      return products;
    }

    return products.filter((product) => product.product_type === sourceType);
  }, [products, sourceType]);

  const selectedProduct = products.find((product) => String(product.id) === productId);

  function handleProductChange(nextProductId) {
    setProductId(nextProductId);
    const nextProduct = products.find((product) => String(product.id) === nextProductId);
    if (nextProduct?.product_type) {
      setSourceType(nextProduct.product_type);
    }
  }

  function handleSourceTypeChange(nextSourceType) {
    setSourceType(nextSourceType);

    const productMatchesType = products.some(
      (product) => String(product.id) === productId && product.product_type === nextSourceType,
    );
    if (!productMatchesType) {
      setProductId("");
    }
  }

  function resetForm() {
    setProductId("");
    setSourceType("");
    setService("");
    setQuantity("");
    setDeliveryLocation("");
    setTargetPrice("");
    setTargetDate("");
    setNotes("");
  }

  function buildRfqPayload() {
    setSubmitError("");

    const unitId = selectedProduct?.unit || unitOptions[0]?.id;
    if (!selectedProduct || !quantity.trim() || !targetDate || !unitId) {
      const message = "Product, quantity, and target date are required.";
      setSubmitError(message);
      showToast("error", message);
      return null;
    }

    const minimumQuantity = Number(selectedProduct.minimum_quantity || 0);
    const requestedQuantity = Number(quantity.trim());
    if (minimumQuantity > 0 && requestedQuantity < minimumQuantity) {
      const unitName = selectedProduct.unit_name || "units";
      const message = `Quantity must be greater than or equal to ${minimumQuantity.toLocaleString()} ${unitName}.`;
      setSubmitError(message);
      showToast("error", message);
      return null;
    }

    const additionalDetails = [
      deliveryLocation.trim() ? `Delivery location: ${deliveryLocation.trim()}` : "",
      targetPrice.trim() ? `Target price: ${targetPrice.trim()}` : "",
      notes.trim(),
    ].filter(Boolean).join("\n\n");
    const payload = new FormData();
    payload.append("product", String(selectedProduct.id));
    payload.append("quantity_required", quantity.trim());
    payload.append("unit", String(unitId));
    payload.append("target_delivery_date", targetDate);
    payload.append("additional_details", additionalDetails);
    payload.append(
      "additional_services",
      JSON.stringify({
        international_sourcing: sourceType === "INTERNATIONAL",
        white_labeling: service === "white-labeling",
        business_consultancy: service === "business-consultancy",
        branding_growth_support: service === "branding-growth",
      }),
    );

    return payload;
  }

  async function submitRfqPayload(payload) {
    setIsSubmitting(true);
    try {
      await createRfq(payload, { skipAuthRedirect: true });
      showToast("success", "RFQ submitted successfully.");
      resetForm();
    } catch (error) {
      if (error?.response?.status === 401) {
        setIsAuthModalOpen(true);
        return;
      }

      const message = getRfqErrorMessage(error);
      setSubmitError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = buildRfqPayload();
    if (!payload) {
      return;
    }

    if (!getAuthSession()) {
      setIsAuthModalOpen(true);
      return;
    }

    await submitRfqPayload(payload);
  }

  async function handleAuthSuccess() {
    setIsAuthModalOpen(false);
    const payload = buildRfqPayload();
    if (payload) {
      await submitRfqPayload(payload);
    }
  }

  return (
    <>
      {toast ? (
        <div
          className={`fixed right-4 top-24 z-[1200] flex w-[calc(100%-2rem)] max-w-[380px] items-start gap-3 rounded-[8px] border bg-white px-4 py-3 font-['Poppins',sans-serif] shadow-[0_18px_50px_rgba(31,17,35,0.2)] sm:right-6 ${
            toast.type === "success" ? "border-emerald-200" : "border-red-200"
          }`}
          role="status"
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
          )}
          <div className="min-w-0">
            <p
              className={`text-sm font-semibold ${
                toast.type === "success" ? "text-emerald-900" : "text-red-900"
              }`}
            >
              {toast.type === "success" ? "Success" : "Unable to submit"}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-[#475569]">{toast.message}</p>
          </div>
        </div>
      ) : null}

      <form
        action="#"
        className="mx-auto w-full max-w-[940px] rounded-[15px] bg-white px-6 py-8 shadow-[0_28px_80px_rgba(36,0,42,0.2)] sm:px-10 sm:py-10 lg:px-11"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <label className="relative block">
          <span className={labelClass}>
            Choose the Product
          </span>
          <select className={selectClass} onChange={(event) => handleProductChange(event.target.value)} value={productId}>
            <option value="" disabled>
              Select a Product
            </option>
            {filteredProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.product_name}
              </option>
            ))}
          </select>
          {selectArrow}
        </label>

        <label className="relative block">
          <span className={labelClass}>
            Choose the Source Type
          </span>
          <select className={selectClass} onChange={(event) => handleSourceTypeChange(event.target.value)} value={sourceType}>
            <option value="" disabled>
              Select a Sourcing Type
            </option>
            <option value="DOMESTIC">Domestic</option>
            <option value="INTERNATIONAL">International</option>
          </select>
          {selectArrow}
        </label>

        <label className="relative block">
          <span className={labelClass}>
            Choose the Service
          </span>
          <select className={selectClass} onChange={(event) => setService(event.target.value)} value={service}>
            <option value="">
              Select a service (optional)
            </option>
            {serviceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {selectArrow}
        </label>

        <label className="block">
          <span className={labelClass}>
            Quantity
          </span>
          <input
            className={fieldClass}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Enter minimum order upto 10kg"
            type="text"
            value={quantity}
          />
        </label>

        <label className="block">
          <span className={labelClass}>
            Delivery Location
          </span>
          <input
            className={fieldClass}
            onChange={(event) => setDeliveryLocation(event.target.value)}
            placeholder="city, Country"
            type="text"
            value={deliveryLocation}
          />
        </label>

        <label className="block">
          <span className={labelClass}>
            Target Price (Optional)
          </span>
          <input
            className={fieldClass}
            onChange={(event) => setTargetPrice(event.target.value)}
            placeholder="Budget range"
            type="text"
            value={targetPrice}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>
            Target Date
          </span>
          <input
            className={fieldClass}
            min={minimumTargetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            type="date"
            value={targetDate}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>
            Additional Notes
          </span>
          <textarea
            className="h-[98px] w-full resize-none rounded-[7px] border border-[#d0d0d0] px-3 py-2.5 font-['Poppins',sans-serif] text-[12px] text-[#202020] outline-none placeholder:text-[#777777] focus:border-[#6d0870]"
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anything specific for domestic sourcing?"
            value={notes}
          />
        </label>
        </div>

        {loadError ? (
          <p className="mt-3 text-sm font-semibold text-red-600">
            {loadError}
          </p>
        ) : null}

        <button
          className="mt-4 h-[56px] w-full rounded-[6px] bg-[#6d0870] font-['Poppins',sans-serif] text-base font-semibold text-white transition hover:bg-[#7b137d] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Submitting..." : "Submit RFQ"}
        </button>
      </form>
      <SourcingAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}

