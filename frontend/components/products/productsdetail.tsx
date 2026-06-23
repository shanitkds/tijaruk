// @ts-nocheck
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Footer from "../shares/Footer";
import Navbar from "../shares/Navbar";
import ProductCard from "./ProductCard";

function StarRating() {
  return (
    <div className="flex items-center gap-1 text-[#f3a638]">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className="h-3.5 w-3.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="m10 1.8 2.5 5.1 5.6.8-4 3.9.9 5.5-5-2.7-5 2.7.9-5.5-4-3.9 5.6-.8L10 1.8Z" />
        </svg>
      ))}
    </div>
  );
}

function ShippingIcon() {
  return (
    <Image
      alt=""
      className="h-5 w-5 object-contain"
      height={20}
      src="/ordernowicons/fastshipblack.png"
      width={20}
    />
  );
}

function PaymentsIcon() {
  return (
    <Image
      alt=""
      className="h-5 w-5 object-contain"
      height={20}
      src="/ordernowicons/materialsymbolspayments.png"
      width={20}
    />
  );
}

function ArrowIcon({ direction = "left" }) {
  return (
    <svg
      className={`h-4 w-4 ${direction === "right" ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default function ProductDetailPage({ product, relatedProducts }) {
  const detailImages = [product.image, ...(product.galleryImages || [])];
  const [quantity, setQuantity] = useState(product.minimumOrder);
  const [unit, setUnit] = useState(product.units[0]);
  const [activeTab, setActiveTab] = useState("Product info");
  const [activeSourceMode, setActiveSourceMode] = useState(product.sourceModes[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageViewportRef = useRef(null);
  const relatedRef = useRef(null);
  const activeImageIndexRef = useRef(0);
  const imageItemRefs = useRef([]);
  const scrollRafRef = useRef(null);

  const tabContent =
    activeTab === "Product info" ? product.infoText : product.descriptionText;

  const syncActiveImageIndexFromScroll = () => {
    const viewport = imageViewportRef.current;
    if (!viewport || detailImages.length <= 1) return;

    const center = viewport.scrollTop + viewport.clientHeight * 0.5;
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    imageItemRefs.current.forEach((node, index) => {
      if (!node) return;
      const nodeCenter = node.offsetTop + node.offsetHeight * 0.5;
      const distance = Math.abs(center - nodeCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    if (activeImageIndexRef.current !== bestIndex) {
      activeImageIndexRef.current = bestIndex;
      setActiveImageIndex(bestIndex);
    }
  };

  const handleImageViewportScroll = () => {
    if (scrollRafRef.current) return;
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      syncActiveImageIndexFromScroll();
    });
  };

  const scrollRelated = (direction) => {
    const node = relatedRef.current;

    if (!node) {
      return;
    }

    node.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    activeImageIndexRef.current = 0;
    setActiveImageIndex(0);

    const viewport = imageViewportRef.current;
    if (viewport) {
      viewport.scrollTop = 0;
    }

    const raf = window.requestAnimationFrame(() => {
      syncActiveImageIndexFromScroll();
    });

    return () => {
      window.cancelAnimationFrame(raf);
      if (scrollRafRef.current) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
      scrollRafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f5] text-[#161616]">
      <section className="px-4 pb-16 pt-8 sm:px-6 lg:px-10 lg:pb-20">
        <div className="mx-auto max-w-[1440px]">
          <Navbar />

          <div
            className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:items-start"
          >
            <div className="relative mx-auto w-full max-w-[560px] lg:sticky lg:top-24 lg:mx-0">
              {detailImages.length > 1 ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-6 top-1/2 hidden -translate-y-1/2 flex-col gap-2 lg:flex"
                >
                  {detailImages.map((_, index) => (
                    <span
                      key={index}
                      className={`h-2 w-2 rounded-full transition ${
                        index === activeImageIndex ? "bg-[#5f0c66]" : "bg-black/25"
                      }`}
                    />
                  ))}
                </div>
              ) : null}

              <div
                ref={imageViewportRef}
                className="w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:h-[560px] lg:overflow-y-auto"
                onScroll={handleImageViewportScroll}
                data-lenis-prevent="true"
              >
                <div className="flex flex-col gap-5">
                  {detailImages.map((image, index) => (
                    <div
                      key={image}
                      ref={(node) => {
                        imageItemRefs.current[index] = node;
                      }}
                      className="overflow-hidden rounded-[25px] shadow-[0_28px_70px_rgba(0,0,0,0.12)]"
                    >
                      <Image
                        alt={index === 0 ? product.name : `${product.name} view ${index + 1}`}
                        className="h-[280px] w-full object-cover sm:h-[400px] lg:h-[560px]"
                        height={560}
                         loading="lazy"
                        sizes="(max-width: 1024px) 100vw, 560px"
                        src={image}
                        width={560}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:self-start lg:px-2 lg:pt-3">
              <div className="flex items-center gap-2 text-[12px] text-[#7b7b7b]">
                <StarRating />
                <span>{product.reviews} reviews</span>
              </div>

              <h1 className="mt-2 font-ibrand text-[2.15rem] leading-none text-[#373737] sm:text-[2.65rem]">
                {product.name}
              </h1>
              <p className="mt-2 font-['Poppins',sans-serif] text-[0.98rem] font-semibold text-[#2f2f2f]">
                ${product.detailPrice}
              </p>



              <p className="mt-4 font-['Poppins',sans-serif] text-[14px] text-[#6b6b6b]">
                Enter minimum order upto {product.minimumOrder}
                {product.units[0]}
              </p>

              <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
                <div className="flex h-[48px] items-center rounded-[28px] bg-[#fcdeff] px-2.5 text-[#5f0c66]">
                  <button
                    aria-label="Increase quantity"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[20px] leading-none transition hover:bg-white/70"
                    type="button"
                    onClick={() => setQuantity((value) => value + 1)}
                  >
                    +
                  </button>
                  <span className="min-w-[34px] text-center font-['Poppins',sans-serif] text-[17px] text-black">
                    {quantity}
                  </span>
                  <button
                    aria-label="Decrease quantity"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[20px] leading-none transition hover:bg-white/70"
                    type="button"
                    onClick={() =>
                      setQuantity((value) => Math.max(product.minimumOrder, value - 1))
                    }
                  >
                    -
                  </button>
                </div>

                <label className="relative">
                  <select
                    className="h-[48px] appearance-none rounded-[28px] border-none bg-[#fcdeff] px-4 pr-9 font-['Poppins',sans-serif] text-[17px] text-black outline-none"
                    value={unit}
                    onChange={(event) => setUnit(event.target.value)}
                  >
                    {product.units.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5f0c66]">
                    <ArrowIcon direction="right" />
                  </span>
                </label>

                <Link
                  className="inline-flex h-[48px] flex-1 items-center justify-center rounded-[28px] bg-[#5f0c66] px-6 font-['Poppins',sans-serif] text-[15px] font-semibold text-white transition hover:bg-[#74217a]"
                  href={`/sourcing#rfq`}
                >
                  Send RFQ
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="font-['Poppins',sans-serif] text-[16px] text-[#323232]">
                  <span>Categories:</span>{" "}
                  <span className="font-semibold text-[#191919]">
                    {product.categoriesLabel}
                  </span>
                </p>

                <Link
                  className="inline-flex h-[34px] items-center justify-center rounded-[999px] bg-[#fcdeff] px-4 font-['Poppins',sans-serif] text-[13px] font-medium text-black transition hover:bg-[#f7cfff]"
                  href="/sourcing#domestic"
                >
                  Domestic Sourcing
                </Link>
              </div>

              <div className="mt-6 h-px w-full bg-black/30" />

              <div className="mt-5 flex flex-wrap gap-2.5">
                {["Product info", "Product description"].map((tab, index) => {
                  const isActive = activeTab === tab;

                  return (
                    <button
                      key={tab}
                      className={`h-[40px] rounded-[24px] px-5 font-['Poppins',sans-serif] text-[12px] font-medium transition ${
                        isActive
                          ? index === 0
                            ? "bg-[#5f0c66] text-white"
                            : "bg-[#e39b4d] text-white"
                          : "border border-[#d8cddd] bg-white text-[#5f0c66]"
                      }`}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 max-w-[620px] font-['Poppins',sans-serif] text-[15px] leading-[26px] text-[#6b6b6b]">
                {tabContent}
              </p>

              <div className="mt-6 h-px w-full bg-black/30" />

              <div className="mt-5 flex flex-wrap gap-6 text-[#000000]">
                <div className="flex items-center gap-2 font-['Poppins',sans-serif] text-[15px]">
                  <ShippingIcon />
                  <span>{product.features[0]}</span>
                </div>
                <div className="flex items-center gap-2 font-['Poppins',sans-serif] text-[15px]">
                  <PaymentsIcon />
                  <span>{product.features[1]}</span>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-16 sm:mt-20">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-['Poppins',sans-serif] text-[2.2rem] font-semibold leading-none text-black sm:text-[3rem]">
                Related Products
              </h2>

              <div className="hidden items-center gap-3 sm:flex">
                <button
                  className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#5f0c66] text-white transition hover:bg-[#74217a]"
                  type="button"
                  onClick={() => scrollRelated("left")}
                >
                  <ArrowIcon />
                </button>
                <button
                  className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#5f0c66] text-white transition hover:bg-[#74217a]"
                  type="button"
                  onClick={() => scrollRelated("right")}
                >
                  <ArrowIcon direction="right" />
                </button>
              </div>
            </div>

            <div
              ref={relatedRef}
              className="mt-10 flex gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.slug} className="min-w-[320px] flex-none">
                  <ProductCard compact product={relatedProduct} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

