// @ts-nocheck
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Footer from "../shares/Footer";
import Navbar from "../shares/Navbar";

const HERO_IMAGE = "/products/hero.webp";
const WHO_IMAGE = "/products/hero.webp";

const PRODUCTS_PER_PAGE = 3;

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

function DomesticProductCard({ product }) {
  const baseImageRef = useRef(null);
  const hoverImageRef = useRef(null);
  const hoverTimelineRef = useRef(null);
  const hoverImage = product.hoverImage;
  const hasHoverImage = Boolean(hoverImage);
  const estimatedPrice = product.price
    ? `SAR ${Number(product.price).toLocaleString("en-US")}`
    : "Not added";
  const minimumQuantity = product.minimumQuantity ?? 0;
  const unitName = product.unitName || "Units";

  useEffect(() => {
    if (!hoverImage) return undefined;
    const preloadImage = window.document.createElement("img");
    preloadImage.decoding = "async";
    preloadImage.src = hoverImage;
    return () => { preloadImage.src = ""; };
  }, [hoverImage]);

  useEffect(() => {
    return () => { hoverTimelineRef.current?.kill(); };
  }, []);

  const playImageFade = () => {
    if (!hasHoverImage || !baseImageRef.current || !hoverImageRef.current) return;
    hoverTimelineRef.current?.kill();
    hoverTimelineRef.current = gsap.timeline({ defaults: { duration: 0.45, ease: "power3.out", overwrite: true } });
    hoverTimelineRef.current.to(baseImageRef.current, { scale: 1.04 }, 0).to(hoverImageRef.current, { autoAlpha: 1 }, 0);
  };

  const resetImageFade = () => {
    if (!hasHoverImage || !baseImageRef.current || !hoverImageRef.current) return;
    hoverTimelineRef.current?.kill();
    hoverTimelineRef.current = gsap.timeline({ defaults: { duration: 0.4, ease: "power3.inOut", overwrite: true } });
    hoverTimelineRef.current.to(baseImageRef.current, { scale: 1 }, 0).to(hoverImageRef.current, { autoAlpha: 0 }, 0);
  };

  return (
    <article 
      className="group flex h-full flex-col rounded-[12px] bg-white p-2 shadow-[0_1px_4px_rgba(0,0,0,0.25)] md:p-3"
      onPointerEnter={playImageFade}
      onPointerLeave={resetImageFade}
    >
      <div className="relative overflow-hidden rounded-[9px] bg-gray-100">
        <Image
          ref={baseImageRef}
          alt={product.name}
          className="h-[140px] w-full object-cover sm:h-[210px] md:h-[250px] lg:h-[285px]"
          height={331}
          loading="lazy"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 400px"
          src={product.image}
          width={400}
        />
        
        {hasHoverImage ? (
          <img
            ref={hoverImageRef}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 h-[140px] w-full object-cover opacity-0 sm:h-[210px] md:h-[250px] lg:h-[285px]"
            decoding="async"
            loading="lazy"
            src={hoverImage}
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3 text-center md:px-3 md:pb-2 md:pt-5">
        <h2 className="line-clamp-2 min-h-[30px] font-ibrand text-[13px] leading-[15px] text-[#373737] md:min-h-0 md:text-[19px] md:leading-none">
          {product.name.toUpperCase()}
        </h2>

        <p className="mx-auto mt-1.5 line-clamp-2 min-h-[26px] w-full font-['Poppins',sans-serif] text-[9px] leading-[13px] text-[#7d7b7b] md:mt-3.5 md:min-h-[36px] md:text-[14px] md:leading-[18px]">
          {product.description}
        </p>

        <div className="mx-auto mt-2 grid w-full max-w-[260px] gap-1 font-['Poppins',sans-serif] text-[9px] text-[#707070] md:mt-3 md:gap-1.5 md:text-[12px]">
          <div className="flex items-center justify-between gap-1.5 md:gap-3">
            <span><span className="md:hidden">Est. Price</span><span className="hidden md:inline">Estimated Price</span></span>
            <b className="text-right text-[#373737]">{estimatedPrice}</b>
          </div>
          <div className="flex items-center justify-between gap-1.5 md:gap-3">
            <span><span className="md:hidden">Min. Qty</span><span className="hidden md:inline">Minimum Quantity</span></span>
            <b className="text-right text-[#373737]">
              {minimumQuantity.toLocaleString()} {unitName}
            </b>
          </div>
        </div>

        <div className="mt-auto flex justify-center pt-3 md:mt-5 md:pt-0">
          <Link
            className="relative inline-flex h-10 w-full max-w-[250px] items-center justify-center rounded-[26px] bg-[#5f0c66] font-['Poppins',sans-serif] text-[11px] font-semibold text-white transition hover:bg-[#7a1d84] md:h-[48px] md:text-[14px]"
            href={`/sourcing?product=${product.id}&type=DOMESTIC#rfq`}
          >
            <span className="absolute left-3 h-1.5 w-1.5 rounded-full bg-white md:left-5 md:h-2 md:w-2" />
            <span>Send RFQ</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function SectionHeading() {
  return (
    <div className="inline-flex flex-col items-start">
      <h2 className="font-ibrand text-[29px] leading-[25px] text-[#5f0c66] sm:text-[35px]">
        Products
      </h2>
      <div className="relative mt-2 flex w-full items-center">
        <span className="h-[3px] w-full rounded-full bg-[#5f0c66]" />
        <span className="absolute -right-1 h-[9px] w-[9px] rounded-full bg-[#5f0c66]" />
      </div>
    </div>
  );
}

function WhoWeAreSection() {
  return (
    <section className="pb-20 pt-16 lg:pb-32 lg:pt-20">
      <div className="mx-auto grid max-w-[1240px] gap-9 px-4 sm:px-6 md:grid-cols-[1.08fr_0.92fr] lg:px-0">
        <div className="font-['Poppins',sans-serif]">
          <h2 className="text-[24px] font-semibold leading-[24px] text-[#e39b4d] sm:text-[28px]">
            Who We Are
          </h2>
          <p className="mt-6 max-w-[670px] font-ibrand text-[22px] leading-[1.3] text-[#5f0c66] sm:text-[27px] sm:leading-[36px]">
            Tijaruk is a trade and business platform connecting buyers,
            suppliers, and markets through a structured system.
          </p>

          <div className="mt-11 max-w-[670px] space-y-4 font-['Roboto',sans-serif] text-[14px] leading-[21px] text-[#666] sm:text-[16px]">
            <p>
              Tijaruk is built to simplify how businesses connect across trade.
              We bring buyers and suppliers together through a structured
              platform that removes friction and creates direct, reliable access
              to global markets.
            </p>
            <p>
              By combining sourcing, pricing clarity, and supplier verification
              into one system, we eliminate scattered processes and reduce
              uncertainty. Businesses gain better control over decisions,
              timelines, and outcomes. Our approach is designed to make trade
              more transparent and dependable where connections are clear,
              processes are defined, and opportunities turn into real, scalable
              business.
            </p>
          </div>
        </div>

        <div className="relative min-h-[280px] overflow-hidden rounded-[6px] bg-[#686868] md:mt-0 lg:min-h-[370px]">
          <Image
            alt="Domestic logistics"
            className="h-full w-full object-cover"
            fill
            loading="lazy"
            sizes="(max-width: 767px) 100vw, 45vw"
            src={WHO_IMAGE}
          />
        </div>
      </div>
    </section>
  );
}

export default function DomesticPage() {
  const [domesticProducts, setDomesticProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/products/public/domestic/")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load products.");
        }
        return response.json();
      })
      .then((products) => {
        if (!isMounted) return;
        setDomesticProducts(
          products.map((product) => ({
            id: product.id,
            name: product.product_name,
            description: product.description || "No product description available.",
            image: product.image || "/products/hero.webp",
            hoverImage: product.internal_images?.[0]?.image || null,
            rating: product.supplier_rating || "0",
            price: product.price,
            minimumQuantity: product.minimum_quantity,
            unitName: product.unit_name,
          })),
        );
      })
      .catch(() => {
        if (isMounted) {
          setLoadError("Unable to load domestic products. Please try again.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);
  const totalPages = Math.max(
    1,
    Math.ceil(domesticProducts.length / PRODUCTS_PER_PAGE)
  );

  const visibleProducts = domesticProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const goToPage = (page) => {
    const nextPage = Math.min(totalPages, Math.max(1, page));
    setCurrentPage(nextPage);
    
    // Smooth scroll to top of products section
    const element = document.getElementById("products-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f5] text-[#161616]">
      <section className="px-4 pb-0 pt-3 sm:px-6 lg:px-0 lg:pt-[31px]">
        <div className="mx-auto max-w-[1373px]">
          <Navbar />

          <div className="relative mt-4 h-[360px] overflow-hidden rounded-[6px] sm:mt-5 sm:h-[460px] lg:mt-6 lg:h-[549px]">
            <div className="absolute inset-0">
              <Image
                alt="Domestic sourcing"
                className="h-full w-full object-cover"
                fill
                priority
                sizes="100vw"
                src={HERO_IMAGE}
              />
            </div>
            <div className="absolute inset-0 rounded-[6px] bg-[#220025]/70" />

            <div className="relative flex h-full items-end px-5 pb-8 sm:items-center sm:px-8 sm:pb-0 lg:px-[40px]">
              <div className="max-w-[928px] translate-y-0 text-white sm:translate-y-[56px] lg:translate-y-[112px]">
                <h1 className="font-ibrand text-[36px] leading-[1] sm:text-[55px] lg:text-[63px]">
                  Domestic
                </h1>

                <div className="mt-3 max-w-[330px] space-y-3 font-['Poppins',sans-serif] text-[12px] leading-[17px] text-white sm:mt-[14px] sm:max-w-[720px] sm:space-y-[20px] sm:text-[17px] sm:leading-[24px] lg:max-w-[928px] lg:space-y-[26px] lg:text-[20px] lg:leading-[26px]">
                  <p>
                    At Tijaruk, we empower Saudi businesses, entrepreneurs, and
                    global partners to thrive in today&apos;s fast-moving trade
                    environment. From importing and exporting to business setup,
                    branding, and automation, we provide end-to-end support
                    designed to make every stage of your journey smoother.
                  </p>
                  <p>
                    Whether you are starting fresh, scaling your operations, or
                    taking your products global, our team is here to guide you
                    with trusted expertise and personalized solutions.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <WhoWeAreSection />

      <section id="products-section" className="pb-14">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-0">
          <SectionHeading />

          <div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-7 lg:grid-cols-4 lg:gap-9 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <DomesticProductCard key={product.id} product={product} />
            ))}
            {isLoading ? (
              <p className="col-span-full py-12 text-center text-sm text-[#707070]">
                Loading domestic products...
              </p>
            ) : null}
            {loadError ? (
              <p className="col-span-full py-12 text-center text-sm font-semibold text-red-600">
                {loadError}
              </p>
            ) : null}
            {!isLoading && !loadError && domesticProducts.length === 0 ? (
              <p className="col-span-full py-12 text-center text-sm text-[#707070]">
                No domestic products are currently available.
              </p>
            ) : null}
          </div>

          {domesticProducts.length > 0 ? (
          <div className="mt-8 flex justify-center">
            <div className="inline-flex h-12 items-center justify-center gap-1.5 rounded-[5px] bg-white px-1.5 py-1">
              <button
                aria-label="Previous page"
                className="flex h-8 w-8 items-center justify-center rounded-[5px] text-[#6a1472] transition hover:bg-[#f4ecf6] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentPage === 1}
                type="button"
                onClick={() => goToPage(currentPage - 1)}
              >
                <ArrowIcon />
              </button>

              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                const isActive = currentPage === page;

                return (
                  <button
                    key={page}
                    aria-current={isActive ? "page" : undefined}
                    className={`h-9 min-w-9 rounded-[6px] px-2 font-['Poppins',sans-serif] text-[14px] transition ${
                      isActive
                        ? "bg-[#5f0c66] text-white shadow-[3px_3px_7px_rgba(0,0,0,0.18)]"
                        : "bg-[#e9e9e9] text-[#5f0c66] hover:bg-[#ddd6df]"
                    }`}
                    type="button"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                aria-label="Next page"
                className="flex h-8 w-8 items-center justify-center rounded-[5px] text-[#6a1472] transition hover:bg-[#f4ecf6] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentPage === totalPages}
                type="button"
                onClick={() => goToPage(currentPage + 1)}
              >
                <ArrowIcon direction="right" />
              </button>
            </div>
          </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </main>
  );
}
